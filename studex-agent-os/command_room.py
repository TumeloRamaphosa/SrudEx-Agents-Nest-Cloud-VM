"""Live probes for the Mac command room: OpenMausBot, Hermes, Ollama, CLIs."""

from __future__ import annotations

import json
import os
import shutil
import urllib.error
import urllib.request
from pathlib import Path

HOME = Path.home()

PROBES = (
    {
        "id": "openmaus",
        "name": "OpenMausBot",
        "url": "http://127.0.0.1:18799/",
        "binary": None,
        "role": "Command room / human approvals",
        "public": "https://maus.studex-group.com",
    },
    {
        "id": "ollama",
        "name": "Ollama",
        "url": "http://127.0.0.1:11434/api/tags",
        "binary": "ollama",
        "role": "Local models",
        "public": None,
    },
    {
        "id": "hermes",
        "name": "Hermes ACP",
        "url": None,
        "binary": "hermes-acp",
        "role": "Nous Hermes in OpenMausBot",
        "public": "https://hermes.studex-group.com",
    },
    {
        "id": "claude",
        "name": "Claude Code",
        "url": None,
        "binary": "claude",
        "role": "Cloud coding agent",
        "public": None,
    },
    {
        "id": "cursor",
        "name": "Cursor Agent",
        "url": None,
        "binary": "cursor-agent",
        "role": "Cloud coding agent",
        "public": None,
    },
    {
        "id": "opencode",
        "name": "OpenCode",
        "url": None,
        "binary": "opencode",
        "role": "Local/cloud coding agent",
        "public": None,
    },
    {
        "id": "antigravity",
        "name": "Antigravity",
        "url": None,
        "binary": "agy",
        "role": "Google ACP agent",
        "public": None,
    },
)


def _http_ok(url: str, timeout: float = 2.0) -> tuple[bool, str]:
    try:
        req = urllib.request.Request(url, method="GET")
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            code = getattr(resp, "status", 200)
            return 200 <= code < 500, f"http {code}"
    except urllib.error.HTTPError as exc:
        return 400 <= exc.code < 500, f"http {exc.code}"
    except Exception as exc:
        return False, type(exc).__name__


def _ollama_models() -> list[str]:
    try:
        with urllib.request.urlopen("http://127.0.0.1:11434/api/tags", timeout=2.0) as resp:
            data = json.loads(resp.read().decode())
        return [m.get("name", "") for m in data.get("models", []) if m.get("name")]
    except Exception:
        return []


def _openmaus_engines() -> list[str]:
    cfg = HOME / ".openmausbot" / "config.json"
    if not cfg.exists():
        return []
    try:
        data = json.loads(cfg.read_text(encoding="utf-8"))
        return sorted((data.get("instances") or {}).keys())
    except Exception:
        return []


def probe_command_room() -> dict:
    engines = []
    for spec in PROBES:
        binary_path = shutil.which(spec["binary"]) if spec["binary"] else None
        http_ok, http_detail = (False, "n/a")
        if spec["url"]:
            http_ok, http_detail = _http_ok(spec["url"])
        live = http_ok or bool(binary_path)
        engines.append(
            {
                "id": spec["id"],
                "name": spec["name"],
                "role": spec["role"],
                "status": "green" if live else "red",
                "detail": http_detail if spec["url"] else (binary_path or "missing"),
                "binary": binary_path,
                "public": spec["public"],
            }
        )
    return {
        "host": "mac-command-room",
        "openmaus": "http://127.0.0.1:18799",
        "public": "https://maus.studex-group.com",
        "hermes_public": "https://hermes.studex-group.com",
        "ollama_models": _ollama_models(),
        "openmaus_engines": _openmaus_engines(),
        "engines": engines,
        "data_dir": str(HOME / ".openmausbot"),
        "os_pack": str(HOME / "studex-os-pack"),
        "nest": str(HOME / "The-Nexus-Agents-NEst"),
    }


if __name__ == "__main__":
    print(json.dumps(probe_command_room(), indent=2))
