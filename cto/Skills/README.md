# Skills

CTO-layer agent skills — OpenClaw / ClawHub compatible definitions live here after export from Mac.

## Current state

**Empty scaffold.** Root README mentions `skills/` at repo root (OpenClaw clawhub-ready) but that directory does not exist yet. Planned consolidation:

```
cto/Skills/          ← CTO-owned skills (this vault)
skills/              ← optional repo-root symlink or copy for ClawHub packaging
robusca-brain/skills/← CoS skills (when brain sync is restored)
```

## Adding a skill

1. Create a folder: `cto/Skills/<skill-name>/`
2. Include `SKILL.md` with trigger phrases, tools, and safety rules
3. Link from [`../HOME.md`](../HOME.md)
4. PR review — no credentials, no auto-posting without Agent Lord approval

## Seed ideas (not implemented)

| Skill | Purpose |
|-------|---------|
| `nest-health` | Wrap `nest-status` + War Room `/api/health` |
| `os-bringup` | Walk through [`docs/OS-BRINGUP-CHECKLIST.md`](../../docs/OS-BRINGUP-CHECKLIST.md) |
| `repo-inventory` | Summarize [`docs/INVENTORY.md`](../../docs/INVENTORY.md) |
