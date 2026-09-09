# solo-founder-skills — Catalog Policy

**Catalog:** solo-founder-skills (OpenClaw / ClawHub skill set)  
**Owner:** Claudio-CTO  
**Policy version:** 2026-09-03 mirror

---

## Catalog policy

1. **Curated, not exhaustive** — install skills that match an active role bundle; avoid importing the full catalog into every agent identity.
2. **One identity, one bundle** — of 278 OpenClaw agents, most should map to a single bundle below; duplicates inflate disk and session count.
3. **No secrets in SKILL.md** — skills reference env var *names* only; values live in local secret store.
4. **Review before ClawHub publish** — skills exported to Nest land in `cto/Skills/<name>/` via PR.
5. **Deprecate loudly** — retired skills get a one-line note in this file and removal from role bundles.

---

## Recommended role bundles

### Claudio (CTO / control plane)

| Skill theme | Use |
|-------------|-----|
| `nest-health` / infra audit | OS bring-up, checklist walks |
| `repo-inventory` | Summarize Nest + system map |
| `os-bringup` | Prioritized recovery |
| Solo-founder: **ops**, **debugging**, **docs** | Day-to-day CTO loop |

**Avoid on Claudio identity:** marketing copy generation, unchecked Shopify write tools.

### Product

| Skill theme | Use |
|-------------|-----|
| Spec → tasks | Backlog breakdown |
| User research synthesis | Read-only aggregation |
| Solo-founder: **product**, **prioritization** | Roadmap support |

**Guardrail:** no production deploy triggers without Eng + Claudio review.

### Engineering

| Skill theme | Use |
|-------------|-----|
| Code review / refactor | PR assistance |
| Test & CI patterns | GitHub workflow design |
| Solo-founder: **engineering**, **architecture** | Implementation |

**Guardrail:** commits go through Git only — not Obsidian patches.

### Marketing

| Skill theme | Use |
|-------------|-----|
| Content drafting | **Draft only** — approval required before post |
| Calendar planning | Schedule proposals |
| Solo-founder: **marketing**, **copy** | Campaign support |

**Guardrail:** aligns with Nest rule — never post without Agent Lord approval.

### Customer success (CS)

| Skill theme | Use |
|-------------|-----|
| Ticket triage templates | Draft replies |
| FAQ maintenance | Drive `40-Knowledge/` |
| Solo-founder: **support**, **comms** | Response drafting |

**Guardrail:** customer names → initials only in any exported note.

---

## Installation notes (Mac OpenClaw)

- Install bundle per **Hermes** or dedicated sub-agent — not all 278 identities.
- After identity audit (see system map R3), target **<30 active identities** with explicit bundles.
- Export installed skill list periodically → `cto/Skills/installed-manifest.md` (future).

---

## Related

- [`README.md`](README.md) — folder conventions
- [`../Systems/current-system-map.md`](../Systems/current-system-map.md) — 278 agents risk
