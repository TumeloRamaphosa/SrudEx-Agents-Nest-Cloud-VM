"""
StudEx Agent OS - Finance Client
CLI client for the Finance agent.

Usage:
    python clients/finance_client.py "margin report"
    python clients/finance_client.py "pnl summary"
    python clients/finance_client.py "pricing 250 180"

Set DIRECT=1 to run the agent locally without the Flask API:
    DIRECT=1 python clients/finance_client.py "margin report"
"""

import json
import os
import sys
import urllib.error
import urllib.request

# Make agents/ importable when running this script directly
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
AGENT_OS_DIR = os.path.dirname(SCRIPT_DIR)
sys.path.insert(0, AGENT_OS_DIR)

API_BASE = os.getenv("STUDEX_API", "http://localhost:5000")


def run_via_api(task):
    """Send a task to the Finance agent API"""
    url = f"{API_BASE}/api/agent/finance/task"
    payload = json.dumps({"task": task}).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read().decode("utf-8"))


def run_direct(task):
    """Run the Finance agent directly"""
    from agents.finance import FinanceAgent

    agent = FinanceAgent()
    return agent.run(task)


def main():
    task = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else "pnl summary"

    if os.getenv("DIRECT"):
        result = run_direct(task)
    else:
        try:
            result = run_via_api(task)
        except urllib.error.URLError as e:
            print(f"API unreachable ({e}); falling back to direct execution.")
            result = run_direct(task)

    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
