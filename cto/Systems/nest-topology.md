# Nest Topology

**Status:** scaffold — relationships inferred from repo layout, not live probes.

## Layers

| Layer | Location | Runtime | Notes |
|-------|----------|---------|-------|
| Mission control | `war-room/` | Node / Express / React | **Port 5000** — primary on VM; see port conflict below |
| Agent OS | `studex-agent-os/` | Python / Flask | **Also defaults to port 5000** — conflict with War Room |
| Sub-agents | `agents/` | Node | shopify-agent, content-pipeline, approval-bot, discord-bot |
| Orchestration CLI | `studex-nest-cli/` | Bash | `nest-status`, `nest-pull`, etc. — expects `~/nest` clone on VM |
| Compose | `docker/docker-compose.yml` | Docker | War Room + agents + nginx |
| CTO vault | `cto/` | Git / markdown | This tree |
| CoS brain | `robusca-brain/` | Git sync | **Empty in repo today** — content expected via sync from Robusca workspace |

## Replication model (from existing docs)

```
PRIMARY (Perplexity / Robusca)
    ↓ delegates
VM (Orgo — docker compose)
    ↓ commits
GitHub (this repo)
    ↑ pulls
D@RK F@C#0RY / other builders
```

## Agent registration (War Room)

Documented in root README — endpoints exist in `war-room/` server routes. **Whether the VM endpoint is reachable from Mac OpenClaw has not been verified in CI.**

## Port 5000 conflict (R9)

| Process | Path | Port | Health endpoint |
|---------|------|------|-----------------|
| War Room | `docker/docker-compose.yml` → `war-room/` | 5000 | `/api/health` |
| Agent OS | `studex-agent-os/app.py` | 5000 | `/health` |

**Rule:** One listener on `:5000` per host. VM always-on → **War Room only**. Agent OS dev → use another port or another machine.

**Verify before boot:** `lsof -i :5000` — unexpected listener blocks compose or misleads `boot-nest.sh`.

## Open questions

- [ ] Single source of truth: `robusca-brain/` vs `cto/` vs Obsidian vault
- [ ] `docker-compose` agent volume paths (`./agents/...`) vs repo root `agents/` — verify on VM before production boot
