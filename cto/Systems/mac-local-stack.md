# Mac Local Stack — OpenClaw, Hermes, ClawX

**Authoritative audit:** [`current-system-map.md`](current-system-map.md) (2026-09-03)  
**Status:** degraded locally — OrbStack stopped, Gitea auth failing, Hermes/WhatsApp/Ollama issues

This repo does **not** contain OpenClaw, Hermes, or ClawX install configs — only documentation.

## What exists where

| Tool | Typical role | In this repo? | Wired to Nest? |
|------|--------------|---------------|----------------|
| **OpenClaw** | Local agent runtime + skills (ClawHub) | Referenced in README (`skills/` planned); **no `skills/` directory in repo** | Unknown |
| **Hermes** | CTO / DevOps agent persona; Agent OS deployment cited in `studex-agent-os/README.md` | Docs + War Room UI references (`t.rama.studexgroup.cto@agentmail.to`) | Partial — email/UI only |
| **ClawX** | Local Mac UI / gateway for claw agents | Not referenced in repo code | Unknown |

## Intended relationship (target architecture)

```
Mac (developer)
├── OpenClaw / ClawX    → local skills, fast iteration
├── Hermes session      → CTO tasks, code review
└── git push            → The-Nexus-Agents-NEst

VM (always-on)
├── docker compose      → war-room + agents
├── nest-cli            → health / logs / pull
└── AgentMail webhooks  → inbound mail → (OpenClaw session — not verified here)
```

## Honest gaps

1. No automation in this repo connects OpenClaw on Mac to the VM task queue.
2. `studex-obsidian-vault/07-Operations/AGENTMAIL-SETUP.md` describes AgentMail → OpenClaw webhook flow — **treat as design doc until re-validated**.
3. Claudio vault (`cto/`) is the Git-backed home for CTO knowledge; Hermes may remain the **runtime persona** until explicitly merged or aliased.

## Next steps (CTO)

- [ ] Export OpenClaw skill manifest → `cto/Skills/` (no secrets)
- [ ] Document ClawX gateway URL / port in `Systems/` after local verification
- [ ] Add smoke test: Mac → `POST /api/agents/register` against VM War Room
