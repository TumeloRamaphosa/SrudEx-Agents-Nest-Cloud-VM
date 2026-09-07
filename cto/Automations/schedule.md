# Automation Schedule

**Executable location:** `skunk-works/cron/` on the Mac (local path — **not** in The-Nexus-Agents-NEst repo)  
**Document of record:** this file in Claudio-CTO  
**Last reviewed:** 2026-09-03  
**Overall health:** 🔴 multiple jobs failing or not installed

Cron definitions are **documented here**; scripts run from Mac `skunk-works/cron/`. Do not commit cron secrets or env files to Nest.

---

## Job registry

| Job | Interval | Owner | Purpose | Status (2026-09-03) |
|-----|----------|-------|---------|---------------------|
| Hermes heartbeat | 15m | Hermes | Liveness ping / session keep-alive | 🟡 runs — Hermes overall degraded |
| Activity monitor | 20m | Claudio / ops | Agent activity sweep | 🟡 assumed running — verify logs |
| Agent sync | 30m | OpenClaw → Gitea | Push agent state to Gitea | 🔴 **Gitea push failing** (auth) |
| Brain sync | 1h | Robusca | Sync brain workspace to git | 🟡 hourly — `robusca-brain/` empty in Nest |
| WhatsApp poll | 1h | Hermes | WhatsApp channel health | 🔴 **disconnected on Hermes** |
| VM fleet check | 3h | Claudio | Remote VM health sweep | 🟡 scheduled — VM not verified in this audit |
| Claudio status report | 6h | Claudio | Auto status snapshot | ❌ **not installed** |
| Daily backup | daily | Claudio | Vault + config backup | 🔴 **broken** |

---

## Nest repo jobs (when VM booted)

These are defined in Nest code/config, not Mac cron:

| Job | Location | Status |
|-----|----------|--------|
| Docker stack | `docker/docker-compose.yml` | Manual / `scripts/boot-nest.sh` |
| Shopify agent loop | `agents/shopify-agent/` | Needs Shopify `.env` |
| Content pipeline | `agents/content-pipeline/` | Needs approval hook |
| Nest CLI | `studex-nest-cli/` | On-demand — `nest-status`, `nest-pull` |

---

## Guardrails

See [`guardrails.md`](guardrails.md). Every cron job must:

1. Log to a report file or `cto/Reports/` — no silent failure.
2. Never write secrets to stdout, Obsidian, Drive, or Git.
3. Fail closed on auth errors (do not retry with embedded credentials).
4. Respect Agent Lord approval rules for outbound content and commerce actions.

---

## Recovery order (when fixing schedule)

1. Fix Gitea auth → unblock **agent sync** (30m).
2. Repair OrbStack → restore Buzz/Katya dependents.
3. Reconnect WhatsApp on Hermes → unblock hourly poll.
4. Install **Claudio status** (6h) after status script exists in `skunk-works/cron/`.
5. Repair **daily backup** last — verify destination has disk space first.

---

## Verification commands (Mac — adjust paths)

```bash
# List local cron entries (human review — output may vary)
crontab -l 2>/dev/null | grep -i skunk-works || echo "no skunk-works entries in user crontab"

# Inspect script dir (if present locally)
ls -la ~/skunk-works/cron/ 2>/dev/null || echo "skunk-works/cron not on this host"
```

Do not paste cron output containing tokens into Git.
