# Drive — Exchange Folder Contract

**Purpose:** Human ↔ agent file exchange without polluting Git or Obsidian decision docs.  
**Rule:** No credentials in any folder. **Inbox until reviewed.**

---

## Folder layout

```
Drive/
├── 00-Inbox/           ← drop zone; unreviewed; never authoritative
├── 10-Working/         ← active drafts agents + human edit together
├── 20-Review/          ← ready for human sign-off
├── 30-Published/       ← approved artifacts safe to reference
├── 40-Knowledge/       ← long-lived reference (sanitized)
├── 50-Exports/         ← Obsidian/PDF/CSV exports (no secrets)
├── 60-Assets/          ← diagrams, screenshots (no PII)
├── 70-Legal/           ← contracts summaries — redacted only
├── 80-Scratch/         ← ephemeral; safe to delete monthly
└── 90-Archive/         ← cold storage; prune when disk full
```

---

## Promotion workflow

```
00-Inbox → 10-Working → 20-Review → 30-Published
                ↓                        ↓
           80-Scratch              40-Knowledge (if durable)
                ↓
           90-Archive (when done)
```

| Transition | Who | Criteria |
|------------|-----|----------|
| → `00-Inbox` | Anyone / any agent | Raw drop; may be wrong or duplicate |
| → `10-Working` | Claudio or human | Triage complete; work started |
| → `20-Review` | Agent | Draft complete; needs human eyes |
| → `30-Published` | **Human only** | Approved for operational use |
| → `90-Archive` | Claudio | Superseded or disk pressure (see R2) |

---

## Folder rules

| Folder | Git in Nest? | Retention |
|--------|--------------|-----------|
| `00-Inbox` | **No** — exclude from rsync to Nest | Clear weekly |
| `10-Working` | Selective PRs only | Until promoted or scrapped |
| `20-Review` | No | Until approved |
| `30-Published` | Yes — sanitized | Long-lived |
| `40-Knowledge` | Yes | Long-lived |
| `50-Exports` | Yes — scrub first | Medium |
| `60-Assets` | Yes — prefer LFS for large | Long-lived |
| `70-Legal` | Redacted summaries only | Legal retention policy |
| `80-Scratch` | No | ≤ 30 days |
| `90-Archive` | Optional | Until volume recovery |

---

## Proposal status

This contract is a **proposal mirrored from Claudio-CTO** — physical folders may not all exist on disk yet. Create on Mac first; mirror only `30-Published` and above to Nest Git.

---

## Disk pressure (2026-09-03)

Data volume nearly full — prioritize:

1. Move stale `80-Scratch` → `90-Archive` or delete
2. Prune large exports in `50-Exports`
3. Do **not** archive `.openclaw` into Drive — handle in OpenClaw session cleanup instead
