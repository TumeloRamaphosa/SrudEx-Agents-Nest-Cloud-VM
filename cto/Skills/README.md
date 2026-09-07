# Skills

CTO-layer agent skills — OpenClaw / ClawHub compatible definitions and catalog policy.

## Documents

| File | Purpose |
|------|---------|
| [`solo-founder-skills.md`](solo-founder-skills.md) | Catalog policy + role bundles (Claudio, Product, Eng, Marketing, CS) |

## Layout

```
cto/Skills/          ← CTO-owned skills + policy (this vault)
skills/              ← optional repo-root copy for ClawHub packaging (not created yet)
robusca-brain/skills/← CoS skills (when brain sync is restored)
```

## Adding a skill

1. Create `cto/Skills/<skill-name>/SKILL.md`
2. No secrets — env var names only
3. Assign to one role bundle in `solo-founder-skills.md`
4. PR review — no auto-posting without Agent Lord approval
