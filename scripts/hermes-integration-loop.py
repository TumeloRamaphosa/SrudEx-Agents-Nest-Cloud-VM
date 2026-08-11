#!/usr/bin/env python3
"""Integration check loop for the Hermes + StudEx + provider setup.

Usage:
    python3 scripts/hermes-integration-loop.py
    python3 scripts/hermes-integration-loop.py --loop
"""

import argparse
import os
import sys
import time
from pathlib import Path

import requests

REPO_ROOT = Path(__file__).resolve().parent.parent
ENV_FILE = REPO_ROOT / "studex-agent-os" / ".env"


def _load_dotenv():
    """Load a simple KEY=VALUE .env file into os.environ if it exists."""
    if ENV_FILE.exists():
        with open(ENV_FILE) as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, value = line.split("=", 1)
                os.environ.setdefault(key.strip(), value.strip())


def _check_url(label, url, timeout=3):
    try:
        r = requests.get(url, timeout=timeout)
        if r.status_code == 200:
            return True, f"{label}: OK ({url})"
    except Exception as exc:
        return False, f"{label}: FAIL ({url}) — {exc}"
    return False, f"{label}: FAIL ({url}) — HTTP {r.status_code}"


def _check_providers():
    checks = []

    # StudEx Agent OS
    ok, msg = _check_url("StudEx Agent OS", "http://localhost:5000/health")
    checks.append((ok, msg))

    # Grok config
    if os.getenv("GROK_API_KEY"):
        checks.append((True, "Grok API key configured"))
    else:
        checks.append((False, "Grok API key missing (set GROK_API_KEY)"))

    # Quinn config
    quinn_url = os.getenv("QUINN_BASE_URL", "")
    quinn_key = os.getenv("QUINN_API_KEY", "")
    if quinn_url and quinn_key:
        checks.append((True, f"Quinn endpoint configured ({quinn_url})"))
    elif quinn_url:
        checks.append((False, "Quinn base URL set but QUINN_API_KEY missing"))
    else:
        checks.append((False, "Quinn endpoint not configured (set QUINN_BASE_URL and QUINN_API_KEY)"))

    # Local llama server
    local_url = os.getenv("LOCAL_LLAMA_BASE_URL", "http://localhost:9090/v1")
    ok, msg = _check_url("Local llama-server", f"{local_url}/models")
    checks.append((ok, msg))

    return checks


def _print_status(checks):
    print("\n" + "=" * 60)
    all_ok = True
    for ok, msg in checks:
        mark = "OK" if ok else "XX"
        print(f"[{mark}] {msg}")
        if not ok:
            all_ok = False
    print("=" * 60)
    if all_ok:
        print("All checks passed — Hermes dashboard is ready.")
    else:
        print("Some checks failed. Fix the items above and re-run.")
    print()
    return all_ok


def main():
    parser = argparse.ArgumentParser(description="Hermes integration check")
    parser.add_argument("--loop", action="store_true", help="Loop until all checks pass")
    args = parser.parse_args()

    _load_dotenv()

    while True:
        checks = _check_providers()
        all_ok = _print_status(checks)
        if all_ok or not args.loop:
            sys.exit(0 if all_ok else 1)
        time.sleep(10)


if __name__ == "__main__":
    main()
