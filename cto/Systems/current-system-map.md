# Current System Map

**Audited:** 2026-09-03 (Mac local stack)  
**Auditor:** Claudio-CTO / human review  
**Nest mirror updated:** 2026-09-07 — **docs only; not a re-audit**  
**Status (as of audit):** degraded — multiple subsystems down or failing  

> **Stale until re-verified:** Everything below reflects the **2026-09-03** audit snapshot. Do **not** treat this map as current health without a **fresh Mac pass** (OrbStack, Gitea, Hermes, disk, ports). A newer “all green” status is **not** claimed here.

**Next audit due:** fresh Mac walk after OrbStack repair + Gitea auth fix

---

## Local Mac stack

| Component | Role | Status (2026-09-03) | Notes |
|-----------|------|---------------------|-------|
| **ClawX** | Local gateway / UI for claw agents | 🟡 | Part of OpenClaw stack |
| **OpenClaw** | Agent runtime + skills | 🟡 | Large footprint — see inventory |
| **OpenClaw Dench** | Dench channel plugin instance | 🟡 | Separate from main OpenClaw tree |
| **Hermes** | CTO runtime persona | 🔴 degraded | Heartbeat jobs run; Ollama/Gitea/WhatsApp issues |
| **PicoClaw** | Lightweight claw runtime | 🟡 | Present in stack |
| **Ollama** | Local LLM inference | 🔴 degraded | Referenced as unhealthy in status report |
| **Gitea** | Self-hosted git / sync target | 🔴 auth failure | Blocks agent-sync push |
| **Buzz / Katya** | OrbStack-hosted services | 🔴 | OrbStack needs repair |
| **OrbStack** | Mac container runtime | 🔴 stopped | **Ports still active — risk** |

Executable cron jobs live under **`skunk-works/cron/`** on the Mac (not in Nest repo) — documented in [`../Automations/schedule.md`](../Automations/schedule.md).

---

## OpenClaw inventory (2026-09-03 audit)

| Metric | Value | Risk |
|--------|-------|------|
| OpenClaw agents | **278** | Too many configured identities |
| Agency workspaces | **270** | Operational complexity |
| Sessions | **399** | Stale session cleanup needed |
| Nested git repos in `.openclaw` | **43** | Orphan repos; sync and auth drift |
| `~/.openclaw` disk | **~5.9 GB** | Contributes to volume pressure |
| Internal Data volume | **97% used** (~31 Gi free) | Backup and session writes at risk |

**Not the same as Grok Bot seats** (~7 named Company OS / Stud-Bot roles) — see [`grok-bot-seats.md`](grok-bot-seats.md).

---

## Port 5000 conflict (open risk — R9)

Two Nest components default to **host port 5000**. Only one can bind at a time on a given machine.

| Consumer | Location | Binds | Health probe |
|----------|----------|-------|--------------|
| **War Room** (primary VM stack) | `war-room/` via `docker/docker-compose.yml` | `0.0.0.0:5000` → container :5000 | `GET /api/health` — used by `scripts/boot-nest.sh` |
| **StudEx Agent OS** (optional Flask app) | `studex-agent-os/app.py` | `0.0.0.0:5000` | `GET /health` (different path) |

**Impact**

- Starting Agent OS while War Room compose is up → **bind failure** or silent override depending on start order.
- Running Agent OS alone then `./scripts/boot-nest.sh` → health check may hit **wrong process** (`/api/health` vs `/health`).
- Docs, nest-cli, and agents assume War Room owns `:5000` on the VM (`WAR_ROOM_URL`, discord-bot, shopify-agent).

**Resolution (pick one per host — not automated in repo)**

1. **VM / always-on:** War Room via docker compose only; do not run `studex-agent-os/app.py` on the same host.
2. **Dev Agent OS:** Run Flask on alternate port (e.g. `5001`) — requires local change to `app.py` or env; not committed here.
3. **Before boot:** `lsof -i :5000` (Mac/Linux) — confirm expected process.

Status: **open** — see checklist §7 and [`nest-topology.md`](nest-topology.md).

---

## Nest / cloud (Git-backed)

| Component | Location | Status |
|-----------|----------|--------|
| The-Nexus-Agents-NEst | GitHub | 🟡 bootstrap PR — structure + docs |
| War Room | `war-room/` + docker | ❓ not re-audited on VM this cycle |
| Node sub-agents | `agents/` + docker | ❓ needs `.env` on host |
| robusca-brain | `robusca-brain/` | ❌ empty in repo |
| VM fleet check | cron every 3h | 🟡 job exists — VM state not verified here |

---

## Active risks (prioritized)

| # | Risk | Severity | Mitigation |
|---|------|----------|------------|
| R1 | **OrbStack stopped but ports still active** | High | Repair OrbStack; verify nothing listens on stale bindings |
| R2 | **Data volume nearly full** (97% used; ~31 Gi free) | High | Prune `.openclaw` sessions; archive Drive `90-Archive` |
| R3 | **Too many configured agent identities** (278) | Medium | Identity audit; retire unused agents |
| R4 | **Gitea auth failure** | High | Fix credentials locally; unblock agent-sync push |
| R5 | **Obsidian automation split** | Medium | Consolidate triggers; one schedule doc (this vault) |
| R6 | **Exposed gateway credential** | **Critical** | **Rotate before any remote exposure** — do not document value here |
| R7 | WhatsApp disconnected on Hermes | Medium | Reconnect channel — see bring-up checklist |
| R8 | Tailscale / Mac1 registry | Medium | Reconnect for private registry access |
| R9 | **Port 5000: War Room vs Agent OS** | Medium | One primary per host; see section above |

---

## Architecture sketch

```
Mac (Claudio control plane)
├── Obsidian: Claudio-CTO vault
├── skunk-works/cron/          ← executable schedules
├── ~/.openclaw/               ← 278 agents, ~5.9GB
├── ClawX + OpenClaw + Hermes
├── Ollama (degraded)
├── Gitea (auth failing)
└── OrbStack → Buzz/Katya (STOPPED — ports active ⚠)

GitHub: The-Nexus-Agents-NEst
├── cto/                       ← this mirror
├── docker/ + war-room/
└── agents/

VM (when up)
└── docker compose + nest-cli
```

---

## Related docs

- [`grok-bot-seats.md`](grok-bot-seats.md) — Grok seats vs 278 OpenClaw agents
- [`mac-local-stack.md`](mac-local-stack.md) — OpenClaw / Hermes / ClawX relationship to Nest
- [`nest-topology.md`](nest-topology.md) — Nest repo component map
- [`git-remotes.md`](git-remotes.md) — GitHub vs Gitea
- [`../Reports/2026-09-03-status.md`](../Reports/2026-09-03-status.md) — point-in-time status
