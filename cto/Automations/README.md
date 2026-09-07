# Automations

Scheduled jobs, webhooks, and deploy hooks for the CTO / Nest layer.

## Documents

| File | Purpose |
|------|---------|
| [`schedule.md`](schedule.md) | Mac `skunk-works/cron/` job registry + status |
| [`guardrails.md`](guardrails.md) | SoT boundaries, fail-closed rules, observability |

## Nest repo jobs (when VM booted)

| Automation | Location | Status |
|------------|----------|--------|
| Docker Compose stack | `docker/docker-compose.yml` | Defined — requires `.env` on host |
| Boot wrapper | `scripts/boot-nest.sh` | Checks `.env` + War Room health |
| Nest CLI | `studex-nest-cli/` | Bash — `nest-status`, `nest-pull` |
| Shopify agent | `agents/shopify-agent/` | Needs Shopify creds in `.env` |
| Content pipeline | `agents/content-pipeline/` | Needs approval hook |

Mac cron executables are **not** in this repo — see [`schedule.md`](schedule.md).
