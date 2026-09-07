# Claudio-CTO — Control Plane Home

> **Vault:** Claudio-CTO (human-readable control plane for StudEx agents and infrastructure)  
> **Nest mirror:** [`cto/`](.) in [The-Nexus-Agents-NEst](https://github.com/TumeloRamaphosa/The-Nexus-Agents-NEst)  
> **Human owner:** Tumelo Ramaphosa  
> **Last synced:** 2026-09-07 (from local Obsidian vault facts)

Claudio-CTO is the **control plane** — not the runtime. It holds decisions, schedules, reports, and exchange contracts. Code and config live in Git; agents execute on Mac (OpenClaw/Hermes) and VM (Nest docker stack).

---

## Sources of truth

| Domain | Source of truth | Never store here |
|--------|-----------------|------------------|
| **Code & config** | Git (`The-Nexus-Agents-NEst`, app repos, `skunk-works/cron/`) | — |
| **Decisions, schedules, reports** | Claudio-CTO (`cto/` in Nest) | Credentials |
| **File exchange** | Drive ([`Drive/exchange-folder-contract.md`](Drive/exchange-folder-contract.md)) | Secrets, tokens, keys |
| **Unreviewed capture** | Inbox (`Drive/00-Inbox/` or local inbox) | Anything committed before review |

**Hard rules**

1. **No credentials** in Obsidian, Drive, or Git — use local secret stores only.
2. **Inbox until reviewed** — nothing in `00-Inbox` is authoritative until promoted.
3. **Honest status** — degraded beats green-washed; see [`Reports/2026-09-03-status.md`](Reports/2026-09-03-status.md).
4. **Stud-Bot product claims** stay in product tracks — this vault is **infra and agent OS** only.

---

## Quick links

| Area | Path | Purpose |
|------|------|---------|
| Systems | [`Systems/`](Systems/) | Current map, topology, Mac stack |
| Skills | [`Skills/`](Skills/) | solo-founder-skills policy + role bundles |
| Automations | [`Automations/`](Automations/) | Cron schedule, guardrails |
| Reports | [`Reports/`](Reports/) | Status snapshots, weekly templates |
| Drive | [`Drive/`](Drive/) | Exchange folder contract |

**Nest-wide**

- [Repo inventory](../docs/INVENTORY.md)
- [OS bring-up checklist](../docs/OS-BRINGUP-CHECKLIST.md) — **prioritized, degraded status**
- [Boot script](../scripts/boot-nest.sh)

---

## Control plane vs runtime

```
┌─────────────────────────────────────────────────────────────┐
│  Claudio-CTO (this vault)     decisions · schedules · reports│
├─────────────────────────────────────────────────────────────┤
│  Git (Nest + skunk-works)     code · cron scripts · compose  │
├─────────────────────────────────────────────────────────────┤
│  Mac local runtime            ClawX · OpenClaw · Hermes · …  │
├─────────────────────────────────────────────────────────────┤
│  VM / cloud runtime           docker compose · War Room · …  │
└─────────────────────────────────────────────────────────────┘
```

Latest audited map: [`Systems/current-system-map.md`](Systems/current-system-map.md) (2026-09-03).

---

## Daily CTO loop

1. Read latest [`Reports/`](Reports/) — start with [2026-09-03 status](Reports/2026-09-03-status.md).
2. Check [`Automations/schedule.md`](Automations/schedule.md) — which jobs should have run vs actually healthy.
3. Triage [`Drive/00-Inbox/`](Drive/exchange-folder-contract.md) — promote or archive.
4. Work bring-up priorities: [`docs/OS-BRINGUP-CHECKLIST.md`](../docs/OS-BRINGUP-CHECKLIST.md).
5. Mirror substantive vault changes to Nest via PR — never commit credentials.

---

## Sync from local Mac Obsidian vault

```bash
LOCAL_VAULT="$HOME/path/to/Claudio-CTO"   # adjust to your path
NEST_CTO="$HOME/nest/cto"

rsync -av \
  --exclude '.obsidian' \
  --exclude '*.key' \
  --exclude '.env' \
  --exclude '00-Inbox/' \
  "$LOCAL_VAULT/" "$NEST_CTO/"

git -C "$(dirname "$NEST_CTO")" status && git -C "$(dirname "$NEST_CTO")" diff
```

Skip or sanitize `00-Inbox` unless items are reviewed. Redact customer PII to initials in logs.
