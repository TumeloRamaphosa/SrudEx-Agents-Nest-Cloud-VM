"""
StudEx Agent OS - Grok (xAI) client

Thin wrapper over the xAI Responses API (/v1/responses), which is where custom
function calling and the server-side web_search tool live. Knows nothing about
StudEx agents; see orchestrator.py for that.
"""

import json
import os
from typing import Any, Dict, Iterator, List, Optional

import requests

DEFAULT_BASE_URL = "https://api.x.ai/v1"
DEFAULT_MODEL = "grok-4.5"
DEFAULT_TIMEOUT = 240


class GrokError(RuntimeError):
    """Raised when the xAI API is unreachable, unauthorised or misconfigured."""


class GrokClient:
    """Minimal streaming client for the xAI Responses API."""

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
        input_items: List[Dict[str, Any]],
        tools: Optional[List[Dict[str, Any]]],
        stream: bool,
        instructions: Optional[str],
        temperature: float,
    ) -> Dict[str, Any]:
        payload: Dict[str, Any] = {
            "model": self.model,
            "input": input_items,
            "stream": stream,
            "temperature": temperature,
        }
        if instructions:
            payload["instructions"] = instructions
        if tools:
            payload["tools"] = tools
        return payload

    def _post(self, payload: Dict[str, Any], stream: bool) -> requests.Response:
        try:
            response = requests.post(
                f"{self.base_url}/responses",
                headers=self._headers(),
                json=payload,
                stream=stream,
                timeout=self.timeout,
            )
        except requests.RequestException as exc:
            raise GrokError(f"Could not reach the xAI API: {exc}") from exc

        if response.status_code >= 400:
            raise GrokError(f"xAI API error {response.status_code}: {response.text[:500]}")
        return response

    def stream(
        self,
        input_items: List[Dict[str, Any]],
        tools: Optional[List[Dict[str, Any]]] = None,
        instructions: Optional[str] = None,
        temperature: float = 0.3,
    ) -> Iterator[Dict[str, Any]]:
        """Yield raw Responses API SSE events (`response.output_text.delta`, etc.)."""
        response = self._post(
            self._payload(input_items, tools, True, instructions, temperature), stream=True
        )
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
        input_items: List[Dict[str, Any]],
        tools: Optional[List[Dict[str, Any]]] = None,
        instructions: Optional[str] = None,
        temperature: float = 0.3,
    ) -> str:
        """Non-streaming completion; returns the assistant's text."""
        response = self._post(
            self._payload(input_items, tools, False, instructions, temperature), stream=False
        )
        return output_text(response.json().get("output") or [])


def output_text(output_items: List[Dict[str, Any]]) -> str:
    """Concatenate the text of every assistant message in a Responses output list."""
    chunks: List[str] = []
    for item in output_items:
        if item.get("type") != "message":
            continue
        for part in item.get("content") or []:
            if part.get("type") == "output_text" and part.get("text"):
                chunks.append(part["text"])
    return "".join(chunks)
