# Automations

Scheduled jobs, webhooks, and deploy hooks for the CTO / Nest layer.

## Current state

| Automation | Location | Status |
|------------|----------|--------|
| Docker Compose stack | `docker/docker-compose.yml` | Defined — requires `.env` on host |
| Nest CLI | `studex-nest-cli/` | Bash scripts — install via `./install.sh` |
| Shopify hourly agent | `agents/shopify-agent/` | Code present — needs Shopify creds in `.env` |
| Content pipeline | `agents/content-pipeline/` | Code present — needs approval hook |
| AgentMail → OpenClaw | Obsidian ops doc | **Design only — not verified in repo** |

## Conventions

- One markdown file per automation: `YYYY-MM-<name>.md`
- Include: trigger, owner agent, rollback, secrets required (names only — never values)
- Cron on VM should log to `memory/` daily notes or `cto/Reports/`

## Placeholder

Add first automation spec when Mac vault export lands here.
