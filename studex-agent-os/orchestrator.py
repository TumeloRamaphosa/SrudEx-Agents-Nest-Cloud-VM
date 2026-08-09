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

from grok import GrokClient, GrokError, merge_tool_call_deltas

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
        "function": {
            "name": "get_status",
            "description": "Live snapshot of the agent fleet, VM health (CPU/RAM/disk), pipeline totals and cached market data.",
            "parameters": {"type": "object", "properties": {}},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_pipeline",
            "description": "Full deal pipeline: each deal name, value in ZAR, stage and win probability.",
            "parameters": {"type": "object", "properties": {}},
        },
    },
    {
        "type": "function",
        "function": {
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
    },
    {
        "type": "function",
        "function": {
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
    },
    {
        "type": "function",
        "function": {
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
    },
]


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
        messages: List[Dict[str, Any]] = [{"role": "system", "content": self.system_prompt}]
        messages.extend(history)

        for _ in range(MAX_TOOL_ROUNDS):
            content = ""
            tool_calls: Dict[int, Dict[str, Any]] = {}
            try:
                for chunk in self.client.stream(
                    messages, tools=TOOL_SPECS, live_search=live_search
                ):
                    choices = chunk.get("choices") or []
                    if not choices:
                        continue
                    delta = choices[0].get("delta") or {}
                    if delta.get("content"):
                        content += delta["content"]
                        yield {"type": "token", "text": delta["content"]}
                    if delta.get("tool_calls"):
                        merge_tool_call_deltas(tool_calls, delta["tool_calls"])
                    if chunk.get("citations"):
                        yield {"type": "citations", "citations": chunk["citations"]}
            except GrokError as exc:
                yield {"type": "error", "message": str(exc)}
                return

            if not tool_calls:
                yield {"type": "done", "content": content}
                return

            ordered = [tool_calls[i] for i in sorted(tool_calls)]
            messages.append(
                {"role": "assistant", "content": content or None, "tool_calls": ordered}
            )

            for call in ordered:
                name = call["function"]["name"]
                arguments = call["function"]["arguments"]
                yield {"type": "tool_call", "name": name, "arguments": arguments}
                outcome = self._run_tool(name, arguments)
                yield {"type": "tool_result", "name": name, "outcome": outcome}
                messages.append(
                    {
                        "role": "tool",
                        "tool_call_id": call["id"],
                        "content": json.dumps(outcome, default=str)[:20000],
                    }
                )

        yield {
            "type": "error",
            "message": f"Stopped after {MAX_TOOL_ROUNDS} tool rounds without a final answer.",
        }
