"""
StudEx Agent OS - Grok (xAI) client

Thin wrapper over the xAI OpenAI-compatible Chat Completions API.
Knows nothing about StudEx agents; see orchestrator.py for that.
"""

import json
import os
from typing import Any, Dict, Iterator, List, Optional

import requests

DEFAULT_BASE_URL = "https://api.x.ai/v1"
DEFAULT_MODEL = "grok-4.5"
DEFAULT_TIMEOUT = 120


class GrokError(RuntimeError):
    """Raised when the xAI API is unreachable, unauthorised or misconfigured."""


class GrokClient:
    """Minimal streaming client for the xAI chat completions API."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        model: Optional[str] = None,
        timeout: int = DEFAULT_TIMEOUT,
    ):
        self.api_key = api_key or os.environ.get("XAI_API_KEY") or os.environ.get("GROK_API_KEY")
        self.base_url = (base_url or os.environ.get("GROK_BASE_URL") or DEFAULT_BASE_URL).rstrip("/")
        self.model = model or os.environ.get("GROK_MODEL") or DEFAULT_MODEL
        self.timeout = timeout

    @property
    def configured(self) -> bool:
        return bool(self.api_key)

    def _headers(self) -> Dict[str, str]:
        if not self.configured:
            raise GrokError(
                "Grok is not configured: set XAI_API_KEY (get a key at https://console.x.ai)."
            )
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    def _payload(
        self,
        messages: List[Dict[str, Any]],
        tools: Optional[List[Dict[str, Any]]],
        stream: bool,
        live_search: bool,
        temperature: float,
    ) -> Dict[str, Any]:
        payload: Dict[str, Any] = {
            "model": self.model,
            "messages": messages,
            "stream": stream,
            "temperature": temperature,
        }
        if tools:
            payload["tools"] = tools
            payload["tool_choice"] = "auto"
        if live_search:
            # Let Grok decide when to pull realtime web/X data (prices, news, FX).
            payload["search_parameters"] = {"mode": "auto", "return_citations": True}
        return payload

    def stream(
        self,
        messages: List[Dict[str, Any]],
        tools: Optional[List[Dict[str, Any]]] = None,
        live_search: bool = True,
        temperature: float = 0.3,
    ) -> Iterator[Dict[str, Any]]:
        """Yield raw SSE `chunk` dicts from the xAI streaming API."""
        payload = self._payload(messages, tools, True, live_search, temperature)
        try:
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=self._headers(),
                json=payload,
                stream=True,
                timeout=self.timeout,
            )
        except requests.RequestException as exc:
            raise GrokError(f"Could not reach the xAI API: {exc}") from exc

        if response.status_code >= 400:
            raise GrokError(f"xAI API error {response.status_code}: {response.text[:500]}")

        for raw_line in response.iter_lines(decode_unicode=True):
            if not raw_line or not raw_line.startswith("data:"):
                continue
            data = raw_line[len("data:"):].strip()
            if data == "[DONE]":
                return
            try:
                yield json.loads(data)
            except json.JSONDecodeError:
                continue

    def complete(
        self,
        messages: List[Dict[str, Any]],
        tools: Optional[List[Dict[str, Any]]] = None,
        live_search: bool = False,
        temperature: float = 0.3,
    ) -> Dict[str, Any]:
        """Non-streaming completion; returns the assistant message dict."""
        payload = self._payload(messages, tools, False, live_search, temperature)
        try:
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=self._headers(),
                json=payload,
                timeout=self.timeout,
            )
        except requests.RequestException as exc:
            raise GrokError(f"Could not reach the xAI API: {exc}") from exc

        if response.status_code >= 400:
            raise GrokError(f"xAI API error {response.status_code}: {response.text[:500]}")
        body = response.json()
        return body["choices"][0]["message"]


def merge_tool_call_deltas(
    accumulator: Dict[int, Dict[str, Any]], deltas: List[Dict[str, Any]]
) -> None:
    """Merge streamed `tool_calls` deltas into an index-keyed accumulator."""
    for delta in deltas:
        index = delta.get("index", 0)
        slot = accumulator.setdefault(
            index, {"id": "", "type": "function", "function": {"name": "", "arguments": ""}}
        )
        if delta.get("id"):
            slot["id"] = delta["id"]
        function = delta.get("function") or {}
        if function.get("name"):
            slot["function"]["name"] += function["name"]
        if function.get("arguments"):
            slot["function"]["arguments"] += function["arguments"]
