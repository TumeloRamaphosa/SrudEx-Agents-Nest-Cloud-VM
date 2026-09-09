# Automation Guardrails

**Applies to:** Mac `skunk-works/cron/`, Nest docker agents, OpenClaw scheduled tasks  
**Aligned with:** Claudio-CTO SoT rules ([`../HOME.md`](../HOME.md))

---

## Source-of-truth boundaries

| Action | Allowed SoT | Forbidden |
|--------|-------------|-----------|
| Change application code | Git commit + PR | Obsidian-only "latest code" |
| Change cron interval / owner | Claudio-CTO `Automations/schedule.md` | Undocumented crontab edits |
| Exchange files with humans/agents | Drive contract folders | Random repo root drops |
| Store API keys | Local secret store / `.env` (gitignored) | Obsidian, Drive, Git, cron logs |

---

## Execution rules

1. **Inbox until reviewed** — automations must not promote `Drive/00-Inbox` content without human or Claudio review.
2. **Fail closed** — auth, disk full, or missing dependency → exit non-zero and write report; no infinite retry loops.
3. **No outbound without approval** — social posts, Shopify mutations, mass email require Agent Lord (Tumelo) approval (matches Nest README rules).
4. **Initials only** — customer identifiers in logs and reports.
5. **R prefix** — monetary values in ZA context.
6. **Rotate before expose** — any credential suspected in logs or gateway config must be rotated **before** Tailscale/public exposure (see R6 in system map).

---

## Observability minimum

Each scheduled job should emit:

- Start timestamp (ISO 8601)
- Exit code
- One-line summary (success / degraded / failed + reason)
- Path to detailed log on disk (path only — not contents with secrets)

Failed jobs → note in next [`../Reports/`](../Reports/) entry.

---

## Split-brain prevention

**Obsidian automation split** (identified 2026-09-03): multiple triggers may fire the same logical job. Consolidation rule:

- One job → one entry in [`schedule.md`](schedule.md)
- One executable in `skunk-works/cron/`
- Remove duplicate Obsidian plugins / macOS shortcuts after migration

---

## Nest-specific

- Docker agents read **only** from `.env` on the host — never bake secrets into images.
- `scripts/boot-nest.sh` refuses to start without `.env` present.
- War Room mutating APIs require `WAR_ROOM_API_KEY` when not in dev mode.
