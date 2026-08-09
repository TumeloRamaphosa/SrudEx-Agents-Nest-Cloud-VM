"""
StudEx Agent OS - ADAM SMASHER orchestrator

Turns Grok into the operator of the agent fleet: it answers questions about the
business using live VM/pipeline/market state and dispatches work to the
Research / Markets / Ops / Comms / Deals agents through function calling.

Write actions (assigning work, updating deals) are gated: anything that leaves
the building must be approved by a human, per the NEVER-auto-post rule.
"""

import json
from typing import Any, Callable, Dict, Iterator, List, Optional

from grok import GrokClient, GrokError, output_text

MAX_TOOL_ROUNDS = 6

SYSTEM_PROMPT = """You are ADAM SMASHER, the AI chief of staff for StudEx — a South African
meat and commodities trading business. You run a fleet of specialist agents on a single Ubuntu VM:

- research: web searches, market intelligence, counterparty due diligence
- markets: USD/ZAR, Brent, gold, SA grain price tracking
- ops: VM health, PM2/Docker, deployments, nest-cli
- comms: email, Discord and Lark drafting
- deals: pipeline tracking, CRM updates

Operating rules:
1. Ground every factual claim about StudEx in tool output. Call tools before answering
   questions about status, pipeline, market levels or VM health. Never invent numbers.
2. You may draft anything, but you never send, post or publish. Outbound content is queued
   for human approval — say so explicitly when you draft something.
3. Assigning a task to an agent is a real action: only do it when the user asks for work to
   be done, and report the agent and the exact task string back.
4. Money is in ZAR unless stated otherwise. Be concise and specific; traders are reading.
5. If something is outside your tools (bank transfers, signing, hiring), say what you would
   need and stop.
"""

TOOL_SPECS: List[Dict[str, Any]] = [
    {
        "type": "function",
        "name": "get_status",
        "description": "Live snapshot of the agent fleet, VM health (CPU/RAM/disk), pipeline totals and cached market data.",
        "parameters": {"type": "object", "properties": {}},
    },
    {
        "type": "function",
        "name": "get_pipeline",
        "description": "Full deal pipeline: each deal name, value in ZAR, stage and win probability.",
        "parameters": {"type": "object", "properties": {}},
    },
    {
        "type": "function",
        "name": "get_agent_history",
        "description": "Recent tasks handled by one agent, most recent last.",
        "parameters": {
            "type": "object",
            "properties": {
                "agent": {
                    "type": "string",
                    "description": "Agent key: research, markets, ops, comms or deals.",
                },
                "limit": {"type": "integer", "description": "How many entries (default 10)."},
            },
            "required": ["agent"],
        },
    },
    {
        "type": "function",
        "name": "read_agent_memory",
        "description": "Read an agent's persistent memory file (markdown or JSON) from the VM.",
        "parameters": {
            "type": "object",
            "properties": {
                "agent": {
                    "type": "string",
                    "description": "Agent key: research, markets, ops, comms or deals.",
                }
            },
            "required": ["agent"],
        },
    },
    {
        "type": "function",
        "name": "assign_task",
        "description": "Dispatch a concrete task to one agent. Use only when the user asks for work to be done.",
        "parameters": {
            "type": "object",
            "properties": {
                "agent": {
                    "type": "string",
                    "description": "Agent key: research, markets, ops, comms or deals.",
                },
                "task": {
                    "type": "string",
                    "description": "Self-contained instruction, including any deal or counterparty name.",
                },
            },
            "required": ["agent", "task"],
        },
    },
]

WEB_SEARCH_TOOL: Dict[str, Any] = {"type": "web_search"}


class Orchestrator:
    """Runs the Grok tool-calling loop against a set of host-provided tools."""

    def __init__(
        self,
        tools: Dict[str, Callable[..., Any]],
        client: Optional[GrokClient] = None,
        system_prompt: str = SYSTEM_PROMPT,
    ):
        self.tools = tools
        self.client = client or GrokClient()
        self.system_prompt = system_prompt

    def _run_tool(self, name: str, arguments: str) -> Dict[str, Any]:
        handler = self.tools.get(name)
        if handler is None:
            return {"error": f"Unknown tool: {name}"}
        try:
            parsed = json.loads(arguments) if arguments.strip() else {}
        except json.JSONDecodeError:
            return {"error": f"Malformed arguments for {name}: {arguments[:200]}"}
        if not isinstance(parsed, dict):
            return {"error": f"Arguments for {name} must be a JSON object"}
        try:
            return {"result": handler(**parsed)}
        except TypeError as exc:
            return {"error": f"Bad arguments for {name}: {exc}"}
        except Exception as exc:  # a failing tool must not kill the conversation
            return {"error": f"{name} failed: {exc}"}

    def chat(
        self, history: List[Dict[str, Any]], live_search: bool = True
    ) -> Iterator[Dict[str, Any]]:
        """Stream events for one user turn.

        Event types: `token`, `tool_call`, `tool_result`, `citations`, `done`, `error`.
        """
        items: List[Dict[str, Any]] = list(history)
        tools = list(TOOL_SPECS) + ([WEB_SEARCH_TOOL] if live_search else [])

        for _ in range(MAX_TOOL_ROUNDS):
            content = ""
            output: List[Dict[str, Any]] = []
            citations: List[str] = []
            try:
                for event in self.client.stream(
                    items, tools=tools, instructions=self.system_prompt
                ):
                    kind = event.get("type")
                    if kind == "response.output_text.delta":
                        delta = event.get("delta") or ""
                        content += delta
                        yield {"type": "token", "text": delta}
                    elif kind == "response.output_text.annotation.added":
                        url = (event.get("annotation") or {}).get("url")
                        if url and url not in citations:
                            citations.append(url)
                    elif kind == "response.output_item.done":
                        item = event.get("item") or {}
                        if item.get("type") == "web_search_call":
                            action = item.get("action") or {}
                            yield {
                                "type": "tool_call",
                                "name": "web_search",
                                "arguments": json.dumps(
                                    {
                                        key: action[key]
                                        for key in ("type", "query", "url")
                                        if key in action
                                    }
                                ),
                            }
                    elif kind in ("error", "response.failed"):
                        message = json.dumps(event.get("error") or event)[:500]
                        yield {"type": "error", "message": f"xAI stream error: {message}"}
                        return
                    elif kind == "response.completed":
                        output = (event.get("response") or {}).get("output") or []
            except GrokError as exc:
                yield {"type": "error", "message": str(exc)}
                return

            if citations:
                yield {"type": "citations", "citations": citations}

            calls = [item for item in output if item.get("type") == "function_call"]
            if not calls:
                yield {"type": "done", "content": content or output_text(output)}
                return

            # Replay the model's own turn (reasoning + calls) before the results.
            items.extend(output)

            for call in calls:
                name = call.get("name", "")
                arguments = call.get("arguments") or "{}"
                yield {"type": "tool_call", "name": name, "arguments": arguments}
                outcome = self._run_tool(name, arguments)
                yield {"type": "tool_result", "name": name, "outcome": outcome}
                items.append(
                    {
                        "type": "function_call_output",
                        "call_id": call.get("call_id"),
                        "output": json.dumps(outcome, default=str)[:20000],
                    }
                )

        yield {
            "type": "error",
            "message": f"Stopped after {MAX_TOOL_ROUNDS} tool rounds without a final answer.",
        }
