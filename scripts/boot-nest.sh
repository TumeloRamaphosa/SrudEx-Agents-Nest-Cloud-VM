#!/usr/bin/env bash
# boot-nest.sh — thin bring-up wrapper for The Nexus Agents Nest
# Usage: ./scripts/boot-nest.sh [--check-only]
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="${ROOT}/docker/docker-compose.yml"
ENV_FILE="${ROOT}/.env"

red() { printf '\033[0;31m%s\033[0m\n' "$*"; }
green() { printf '\033[0;32m%s\033[0m\n' "$*"; }
yellow() { printf '\033[1;33m%s\033[0m\n' "$*"; }

CHECK_ONLY=false
if [[ "${1:-}" == "--check-only" ]]; then
  CHECK_ONLY=true
fi

cd "$ROOT"

if [[ ! -f "$ENV_FILE" ]]; then
  red "Missing .env — copy from .env.example and fill secrets locally."
  exit 1
fi

if [[ ! -f "$COMPOSE_FILE" ]]; then
  red "Missing compose file: $COMPOSE_FILE"
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  red "docker not found — install Docker before booting the Nest stack."
  exit 1
fi

if $CHECK_ONLY; then
  yellow "Check-only mode — prerequisites OK."
  exit 0
fi

yellow "Starting Nest stack via Docker Compose..."
docker compose -f "$COMPOSE_FILE" up -d

yellow "Waiting for War Room health (max 60s)..."
for i in $(seq 1 30); do
  if curl -sf "http://localhost:5000/api/health" >/dev/null 2>&1; then
    green "War Room responded on :5000/api/health"
    exit 0
  fi
  sleep 2
done

yellow "War Room did not respond in time — check: docker compose -f docker/docker-compose.yml logs war-room-ui"
exit 1
