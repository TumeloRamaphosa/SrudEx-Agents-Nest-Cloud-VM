#!/bin/bash
# Start StudEx Agent OS on this machine (Mac uses 5050 — AirPlay owns 5000).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
export STUDEX_AGENT_OS="$ROOT"
if [[ "$(uname -s)" == "Darwin" ]]; then
  export STUDEX_OS_PORT="${STUDEX_OS_PORT:-5060}"
  export STUDEX_OS_HOST="${STUDEX_OS_HOST:-127.0.0.1}"
else
  export STUDEX_OS_PORT="${STUDEX_OS_PORT:-5000}"
  export STUDEX_OS_HOST="${STUDEX_OS_HOST:-127.0.0.1}"
fi
cd "$ROOT"
exec python3 "$ROOT/app.py"
