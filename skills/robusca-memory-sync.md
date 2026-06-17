---
name: robusca-memory-sync
description: "At the end of every session, write a structured memory log to robusca-brain on GitHub and update Perplexity memory. Use when asked to sync memory, end of session, save session, update second brain, or push memory to GitHub."
metadata:
  author: robusca
  version: '1.0'
  business: StudEx Group
  last_updated: '2026-06-15'
---

# Robusca Memory Sync Skill

## When to Use This Skill

Load this skill when Tumelo says:
- "Sync memory"
- "End of session"
- "Save session"
- "Update second brain"
- "Push memory to GitHub"
- "Wrap up"
- Or when Robusca determines a session has concluded with significant work

**Trigger phrases:** "sync memory", "end of session", "save session", "update Obsidian", "push to GitHub"

## Memory Architecture

```
Robusca Memory Stack:
├── Perplexity memory_update   → persistent facts Robusca remembers about Tumelo
├── robusca-brain/memory/      → session logs pushed to GitHub (searchable history)
├── robusca-brain/MEMORY.md    → rolling summary of key facts (always up to date)
└── Obsidian vault             → local second brain (synced via GitHub when available)
```

## Session Log Format

Write to: `robusca-brain/memory/YYYY-MM-DD.md`

```markdown
# Session Log — {YYYY-MM-DD}
**Agent:** Robusca (Perplexity Computer)
**Agent Lord:** Tumelo Ramaphosa
**Session time:** {HH:MM}–{HH:MM} SAST

---

## What We Did
{2–5 bullet points summarising the session's work}

## Decisions Made
{Key decisions by Tumelo — format: "Decision: [what] → Outcome: [result]"}

## Code / Builds
{Any repos pushed, files deployed, tools installed}

## Content Status
{Any content created, approved, or awaiting approval}

## Next Steps
{Specific actions Tumelo should take, or Robusca should pick up next session}

## Pending / Blocked
{Any tasks that are blocked and why}

## Credentials / Config Updated
{Any new keys, tokens, or config changes — NEVER log raw secrets, log KEY_NAME only}

---
Tags: #session-log #robusca #studex
```

## MEMORY.md Update

Also update `robusca-brain/MEMORY.md` — the rolling master summary:

- Update the "Last session" entry
- Update any facts that changed (e.g. new credentials set, new feature built)
- Add new skills if created this session
- Keep total length under 500 lines

## GitHub Push Procedure

```bash
cd /home/user/workspace/robusca-brain

# Stage the memory files
git add memory/YYYY-MM-DD.md
git add MEMORY.md

# Commit
git commit -m "memory: session log {YYYY-MM-DD} — {one-line summary}"

# Push
git push origin main
```

Authentication: Use the GitHub MCP connector (`github_mcp_direct`) or sandbox git with SSH key if available.

## Perplexity Memory Update

After writing the session log, call `memory_update` with any new durable facts learned this session:

Examples of what to save:
- New credentials set up
- New features built in War Room
- New decisions made about architecture
- Changes to Tumelo's preferences or workflow
- New contacts or partnerships
- New promo codes or campaigns activated

Format: "Remember that [fact from Tumelo's perspective]"

## Obsidian Sync (when available)

When Tumelo's MacBook Pro Comet bridge is active:

```
1. Pull latest robusca-brain to workspace
2. Copy memory/ and protocols/ to Obsidian vault
3. Vault path: ~/Library/Mobile Documents/iCloud~md~obsidian/Documents/[vault-name]/robusca/
4. Use pc push to write files to local Mac
```

Note: Vault writes are SUSPENDED until Tumelo provides the vault via GitHub. Do not attempt `pc push` to Obsidian until Tumelo confirms the vault location.

## End-of-Session Checklist

Before closing the session, Robusca should:

1. ✅ Write session log to `robusca-brain/memory/YYYY-MM-DD.md`
2. ✅ Update `MEMORY.md` with any changed facts
3. ✅ Push to GitHub
4. ✅ Call `memory_update` for any new durable facts
5. ✅ Check: any content pending approval? Flag to Tumelo
6. ✅ Check: any unfulfilled Shopify orders? Flag to Tumelo
7. ✅ Log: any outstanding WhatsApp or credential items still needed
8. ✅ Note: next recommended action for tomorrow morning

## Quick Sync (short sessions)

For quick sessions (< 30 min, no significant changes):

```markdown
# Quick Sync — {YYYY-MM-DD} {time}
{1-2 line summary of what was discussed or done}
Next: {single most important next action}
```

## What NOT to Log

- Customer names or full phone numbers
- Raw API keys, tokens, passwords (log KEY_NAME only: "SHOPIFY_ACCESS_TOKEN updated")
- Full credit card or payment details
- Order details beyond count and total value

## Related Skills

- `studex-morning-brief` — next session starts with this
- All other studex skills — this is the wrap-up for any skill session
