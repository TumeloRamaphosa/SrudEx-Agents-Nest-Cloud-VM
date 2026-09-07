# Nest Topology

**Status:** scaffold — relationships inferred from repo layout, not live probes.

## Layers

| Layer | Location | Runtime | Notes |
|-------|----------|---------|-------|
| Mission control | `war-room/` | Node / Express / React | Port 5000; agent registry + task API documented in root README |
| Agent OS | `studex-agent-os/` | Python / Flask | Alternate dashboard on same port if run standalone — **do not run both without port conflict** |
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

## Open questions

- [ ] Single source of truth: `robusca-brain/` vs `cto/` vs Obsidian vault
- [ ] Port 5000: War Room vs Agent OS — pick one primary on each host
- [ ] `docker-compose` agent volume paths (`./agents/...`) vs repo root `agents/` — verify on VM before production boot
