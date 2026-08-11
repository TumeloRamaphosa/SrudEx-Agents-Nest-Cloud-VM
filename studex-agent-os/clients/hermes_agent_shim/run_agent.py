"""Minimal Hermes Agent shim that proxies chat to the StudEx Agent OS.

The Hermes WebUI expects a ``run_agent.AIAgent`` class. This shim implements
just enough of the public surface to let the WebUI route chat turns to the
StudEx Agent OS ``/v1/chat/completions`` endpoint.
"""

import json
import os
import time
import urllib.error
import urllib.request
from typing import Any

DEFAULT_BASE_URL = os.getenv("STUDEX_API_BASE", "http://localhost:5000/v1")


def _to_text(value: Any) -> str:
    """Flatten a Hermes message/content value to plain text."""
    if value is None:
        return ""
    if isinstance(value, str):
        return value
    if isinstance(value, list):
        return "".join(_to_text(part) for part in value)
    if isinstance(value, dict):
        if "text" in value:
            return value["text"]
        if "content" in value:
            return _to_text(value["content"])
        return str(value)
    return str(value)


class AIAgent:
    """Stub AIAgent that forwards conversation turns to StudEx Agent OS."""

    def __init__(self, *args, **kwargs):
        self.model = kwargs.get("model") or "finance-agent"
        self.provider = kwargs.get("provider") or "custom"
        self.base_url = (kwargs.get("base_url") or "").rstrip("/") or DEFAULT_BASE_URL
        self.api_key = kwargs.get("api_key") or ""

        # Callbacks the WebUI may attach between turns.
        self.stream_delta_callback = kwargs.get("stream_delta_callback")
        self.tool_progress_callback = kwargs.get("tool_progress_callback")
        self.tool_start_callback = kwargs.get("tool_start_callback")
        self.tool_complete_callback = kwargs.get("tool_complete_callback")
        self.status_callback = kwargs.get("status_callback")
        self.interim_assistant_callback = kwargs.get("interim_assistant_callback")
        self.reasoning_callback = kwargs.get("reasoning_callback")

        # Internal turn tracking for the WebUI's active-turn identity helpers.
        self._current_turn_id = None
        self._persist_user_message_idx = None

    def run_conversation(
        self,
        user_message=None,
        system_message=None,
        conversation_history=None,
        task_id=None,
        persist_user_message=None,
        persist_user_timestamp=None,
        **kwargs,
    ) -> dict:
        """Run one chat turn against the StudEx Agent OS OpenAI-compatible endpoint."""
        messages = []

        if system_message:
            messages.append({"role": "system", "content": _to_text(system_message)})

        for msg in conversation_history or []:
            if isinstance(msg, dict):
                role = msg.get("role")
                content = _to_text(msg.get("content"))
                if role and content:
                    messages.append({"role": role, "content": content})

        user_text = _to_text(user_message) or "pnl summary"
        messages.append({"role": "user", "content": user_text})

        payload = {
            "model": self.model,
            "messages": messages,
            "stream": False,
        }
        data = json.dumps(payload).encode("utf-8")
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        url = f"{self.base_url}/chat/completions"
        req = urllib.request.Request(url, data=data, headers=headers, method="POST")

        try:
            with urllib.request.urlopen(req, timeout=120) as resp:
                body = json.loads(resp.read().decode("utf-8"))
            content = body["choices"][0]["message"]["content"]
        except urllib.error.HTTPError as exc:
            content = f"StudEx agent HTTP error {exc.code}: {exc.read().decode('utf-8', errors='ignore')[:200]}"
        except Exception as exc:
            content = f"StudEx agent error: {exc}"

        # Emit a streaming illusion for the WebUI if a callback is wired.
        if callable(self.stream_delta_callback):
            chunk_size = 24
            for i in range(0, len(content), chunk_size):
                self.stream_delta_callback(content[i : i + chunk_size])
                # Very short sleep keeps the UI responsive without slowing the demo.
                time.sleep(0.005)

        # Build the conversation result the WebUI expects.
        result_messages = list(conversation_history or [])
        user_ts = persist_user_timestamp or time.time()
        user_idx = len(result_messages)
        result_messages.append({
            "role": "user",
            "content": user_text,
            "timestamp": user_ts,
        })
        result_messages.append({
            "role": "assistant",
            "content": content,
        })

        self._persist_user_message_idx = user_idx
        self._current_turn_id = str(task_id or f"turn-{int(time.time() * 1000)}")

        return {
            "status": "success",
            "state": "completed",
            "turn_exit_reason": "completed",
            "final_response": content,
            "messages": result_messages,
            "current_turn_user_idx": self._persist_user_message_idx,
            "turn_id": self._current_turn_id,
        }
