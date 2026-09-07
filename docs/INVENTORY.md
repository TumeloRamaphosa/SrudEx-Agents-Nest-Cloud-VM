# Agents Nest — Repository Inventory

**Generated:** 2026-09-07 (bootstrap PR)  
**Repo:** [The-Nexus-Agents-NEst](https://github.com/TumeloRamaphosa/The-Nexus-Agents-NEst)

This inventory describes what is **actually present in the tree today**. It is not a roadmap.

---

## Top-level map

| Path | Present | Role | Maturity |
|------|---------|------|----------|
| [`AGENT-JOIN.md`](../AGENT-JOIN.md) | Yes | Studex fleet join protocol | See [`mcp-bridge/`](../mcp-bridge/) — pack filesystem is **not** Nest Git SoT; Nest SoT for Claudio remains [`cto/`](../cto/HOME.md) |
| [`mcp-bridge/`](../mcp-bridge/) | Yes | Studex OS MCP bridge (thin join slice) | Python MCP server + config examples |
| [`cto/`](../cto/HOME.md) | Yes | Claudio-CTO control plane — HOME, Systems, Automations, Skills, Drive, Reports | **Mirrored from local vault** (2026-09-03 audit) |
| [`studex-agent-os/`](../studex-agent-os/README.md) | Yes | Python Flask Agent OS (research, markets, ops, comms, deals) | Code + docs |
| [`war-room/`](../war-room/WAR_ROOM_SPEC.md) | Yes | Express + React mission control UI | Substantial codebase |
| [`agents/`](../agents/) | Yes | Node sub-agents (Shopify, content, approval, Discord) | Code + tests |
| [`docker/`](../docker/docker-compose.yml) | Yes | Compose stack (War Room, agents, nginx) | Config present |
| [`studex-nest-cli/`](../studex-nest-cli/README.md) | Yes | Bash VM management (`nest-status`, etc.) | Scripts |
| [`studex-obsidian-vault/`](../studex-obsidian-vault/00-Core/INDEX.md) | Yes | StudEx Meat second brain (partial) | Partial content |
| [`etb-cashclaw/`](../etb-cashclaw/) | Yes | CashClaw agent economy layer | Substantial |
| [`studex-auto-meat/`](../studex-auto-meat/) | Yes | Shopify fulfillment automation | Code |
| [`studex-naledi-content/`](../studex-naledi-content/) | Yes | Naledi content engine | Check dir |
| [`studex-app-warehouse/`](../studex-app-warehouse/) | Yes | App build warehouse | Check dir |
| [`studex-cto-playbook/`](../studex-cto-playbook/) | **Empty** | CTO playbook (placeholder dir) | Empty |
| [`robusca-brain/`](../robusca-brain/) | **Empty** | Robusca CoS workspace sync target | Empty |
| [`skills/`](../README.md) | **Missing** | OpenClaw skills (mentioned in README) | Not created |
| [`memory/`](../memory/) | Yes | Daily session logs | Historical notes |
| [`.env.example`](../.env.example) | Yes | Secret template (no values) | Template only |

---

## Agent runtimes

| Agent / persona | Evidence in repo | Live status |
|-----------------|------------------|-------------|
| Robusca (CoS) | README, empty `robusca-brain/` | Sync target not populated |
| Claudio-CTO (control plane) | `cto/` — decisions, schedules, reports | Mirrored from Obsidian vault |
| Hermes (CTO runtime) | Mac local + cron | Degraded per 2026-09-03 audit |
| Charlie / Naledi / board | Obsidian vault, War Room pages | Product/agent UI — separate from Nest boot |
| Node sub-agents | `agents/*` | Runnable with Docker + `.env` |
| ADAM SMASHER / Agent OS agents | `studex-agent-os/agents/*.py` | Runnable via `python3 app.py` |

---

## Infrastructure signals

| Signal | Found in repo | Verified live |
|--------|---------------|---------------|
| Docker Compose | `docker/docker-compose.yml` | Not run in this PR |
| War Room :5000 | war-room server | Referenced in memory logs (2026-06-22) |
| Orgo VM | README VM table | Historical — IPs may be stale |
| AgentMail addresses | README, War Room | Documented |
| GitHub Actions CI | — | **None** |
| Mac OpenClaw stack | `cto/Systems/current-system-map.md` | 278 agents — degraded |
| Grok Bot seats (Company OS / Stud-Bot) | `cto/Systems/grok-bot-seats.md` | ~7 named seats — **not** 278 OpenClaw agents |
| OrbStack / Buzz/Katya | system map | 🔴 stopped, ports active |

---

## Related work (outside this slice)

- **Stud-Bot / Business Ghost Managed** — tracked in `robusca-brain` PR #28 on that repo line; not booted here.
- **Legacy repo name** `SrudEx-Agents-Nest-Cloud-VM` still appears in nested READMEs and nest-cli scripts.

---

## How to refresh this inventory

```bash
# From repo root
find . -maxdepth 2 -type d ! -path './.git*' | sort
```

Update this file when major directories are added or emptied.
