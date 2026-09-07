# Current System Map

**Audited:** 2026-09-03  
**Auditor:** Claudio-CTO / human review  
**Status:** degraded — multiple subsystems down or failing  
**Next audit due:** after OrbStack repair + Gitea auth fix

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
| `~/.openclaw` disk | **~5.9 GB** | Contributes to volume pressure |

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
| R2 | **Data volume nearly full** | High | Prune `.openclaw` sessions; archive Drive `90-Archive` |
| R3 | **Too many configured agent identities** (278) | Medium | Identity audit; retire unused agents |
| R4 | **Gitea auth failure** | High | Fix credentials locally; unblock agent-sync push |
| R5 | **Obsidian automation split** | Medium | Consolidate triggers; one schedule doc (this vault) |
| R6 | **Exposed gateway credential** | **Critical** | **Rotate before any remote exposure** — do not document value here |
| R7 | WhatsApp disconnected on Hermes | Medium | Reconnect channel — see bring-up checklist |
| R8 | Tailscale / Mac1 registry | Medium | Reconnect for private registry access |

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

- [`mac-local-stack.md`](mac-local-stack.md) — OpenClaw / Hermes / ClawX relationship to Nest
- [`nest-topology.md`](nest-topology.md) — Nest repo component map
- [`git-remotes.md`](git-remotes.md) — GitHub vs Gitea
- [`../Reports/2026-09-03-status.md`](../Reports/2026-09-03-status.md) — point-in-time status
