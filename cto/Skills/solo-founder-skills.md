# solo-founder-skills — Catalog Policy

**Catalog:** [solo-founder-skills](https://github.com/whawkinsiv/solo-founder-skills) (59 skills)  
**Owner:** Claudio-CTO  
**Policy version:** 2026-09-07 mirror (facts audited 2026-09-03)

The repository provides 59 playbook-style skills across validation, planning, design, engineering, deployment, growth, retention, finance, legal, and hiring.

---

## Catalog policy

1. **Approved catalog only** — do not distribute all skills to every agent. Assign the minimum relevant bundle per role.
2. **One identity, one bundle** — of 278 OpenClaw agents, most should map to a single bundle below; duplicates inflate disk and session count.
3. **External skills are instructions, not trusted executable code** — review hooks and commands before enabling; never treat third-party SKILL.md as safe to run unchecked.
4. **No secrets in SKILL.md** — skills reference env var *names* only; values live in local secret store.
5. **Review before ClawHub publish** — skills exported to Nest land in `cto/Skills/<name>/` via PR.
6. **Deprecate loudly** — retired skills get a one-line note in this file and removal from role bundles.

---

## Recommended role bundles

### Claudio-CTO (control plane)

| Skills | Use |
|--------|-----|
| `focus`, `prioritize`, `plan`, `finances`, `monitor` | Weekly CTO review, capacity planning, production evidence |

**Also useful:** `nest-health` / infra audit, `repo-inventory`, `os-bringup` (Nest-local skills when installed).

**Avoid on Claudio identity:** marketing copy generation, unchecked Shopify write tools.

### Product

| Skills | Use |
|--------|-----|
| `validate`, `customer-research`, `plan`, `analytics` | Demand validation, ICP, specs, production metrics |

**Guardrail:** no production deploy triggers without Eng + Claudio review.

### Engineering

| Skills | Use |
|--------|-----|
| `build`, `secure`, `test`, `debug`, `deploy` | Implementation, release gates, hosting |

**Also useful:** `integrations` (Google Workspace, Base44, voice, client APIs), `go-live` as pre-deploy gate.

**Guardrail:** commits go through Git only — not Obsidian patches.

### Marketing

| Skills | Use |
|--------|-----|
| `content`, `seo`, `copywriting`, `humanize`, `email` | Campaign planning, editorial pass, sequences |

**Guardrail:** aligns with Nest rule — never post without Agent Lord approval. `humanize` is an editorial pass, **not** automatic publishing permission.

### Client success

| Skills | Use |
|--------|-----|
| `support`, `feedback`, `retention` | Ticket triage, lifecycle, churn prevention |

**Guardrail:** customer names → initials only in any exported note.

---

## Best uses for StudEx

### Executive team

- `focus`, `prioritize`, and `finances` for weekly Claudio-CTO review
- `validate` and `customer-research` before committing agent capacity
- `pricing` for voice-agent and automation packages

### Product and engineering

- `plan` to convert decisions into implementation specifications
- `secure`, `test`, `debug`, and `go-live` as release gates
- `integrations` for Google Workspace, Base44, voice, and client APIs
- `monitor` and `analytics` for production evidence

### Growth team

- `content`, `seo`, `email`, `sales`, and `social-media` for campaign planning
- `humanize` as an editorial pass, not an automatic publishing permission
- `retention`, `support`, and `feedback` for client lifecycle workflows

---

## Installation notes (Mac OpenClaw)

- Install bundle per **Hermes** or dedicated sub-agent — not all 278 identities.
- After identity audit (see system map R3), target **<30 active identities** with explicit bundles.
- Export installed skill list periodically → `cto/Skills/installed-manifest.md` (future).

---

## Related

- [`README.md`](README.md) — folder conventions
- [`../Systems/current-system-map.md`](../Systems/current-system-map.md) — 278 agents risk
