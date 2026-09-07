# Claudio — CTO Vault Home

> **Agent:** Claudio (StudEx Group CTO layer)  
> **Nest repo:** [The-Nexus-Agents-NEst](https://github.com/TumeloRamaphosa/The-Nexus-Agents-NEst)  
> **Human owner:** Tumelo Ramaphosa  
> **Last scaffold update:** 2026-09-07

This vault is the **CTO operating surface** inside the Agents Nest. It mirrors the local Mac CTO vault layout. Content here is synced from disk — this PR scaffolds structure only; do not treat empty folders as live systems.

---

## Quick links

| Area | Path | Purpose |
|------|------|---------|
| Systems | [`Systems/`](Systems/) | Topology, remotes, Mac ↔ VM wiring |
| Skills | [`Skills/`](Skills/) | CTO agent skills (ClawHub / OpenClaw ready) |
| Automations | [`Automations/`](Automations/) | Cron, hooks, CI, deploy flows |
| Reports | [`Reports/`](Reports/) | Weekly status, incident notes, audits |
| Drive | [`Drive/`](Drive/) | Specs, diagrams, exports (no secrets) |

**Nest-wide docs**

- [Repo inventory](../docs/INVENTORY.md)
- [OS bring-up checklist](../docs/OS-BRINGUP-CHECKLIST.md)
- [Boot script](../scripts/boot-nest.sh)

---

## Role in the Nest

```
┌─────────────────────────────────────────────────────────────┐
│  The Nexus Agents Nest (this repo)                          │
├─────────────────────────────────────────────────────────────┤
│  cto/ (Claudio)     ← technical authority, OS bring-up      │
│  studex-agent-os/   ← Python Agent OS (research, ops, …)    │
│  war-room/          ← Mission control UI (:5000)            │
│  agents/            ← Node sub-agents (Shopify, approvals)  │
│  docker/            ← Compose stack for always-on services  │
│  robusca-brain/     ← Chief of Staff workspace (sync target)│
└─────────────────────────────────────────────────────────────┘
         ▲                              ▲
         │ git pull / push               │ register / tasks API
         │                              │
   Mac local stack                 Orgo VM (when deployed)
   OpenClaw · Hermes · ClawX       docker compose + nest-cli
```

**Claudio vs Hermes (honest status):** Existing StudEx docs name **Hermes** as the CTO agent persona on the VM (`hermes@agent.studexmeat.com`). **Claudio** is the CTO vault / Agent OS layer being consolidated here. Wiring between Claudio, Hermes, and OpenClaw is **not verified in this repo** — see [`Systems/mac-local-stack.md`](Systems/mac-local-stack.md).

**Out of scope here:** Stud-Bot product go-live lives in `robusca-brain` (separate PR track). This vault covers **infrastructure and agent OS**, not product marketing claims.

---

## Daily CTO loop (target)

1. Read [`Reports/`](Reports/) for open items.
2. Run [`../scripts/boot-nest.sh`](../scripts/boot-nest.sh) on the VM (or `nest-status` if CLI installed).
3. Check War Room health: `GET /api/health` on port 5000.
4. Mirror substantive changes back to this repo via PR — never commit credentials.

---

## Sync from local Mac vault

When the companion vault on disk has new material, copy into the matching folder here:

```bash
# Example — adjust LOCAL_VAULT to your Mac path
LOCAL_VAULT="$HOME/path/to/cto-vault"
rsync -av --exclude '.obsidian' --exclude '*.key' --exclude '.env' \
  "$LOCAL_VAULT/" ./cto/
git status && git diff
```

**Rules:** No API keys, tokens, or `.env` files. Redact customer PII to initials in logs.
