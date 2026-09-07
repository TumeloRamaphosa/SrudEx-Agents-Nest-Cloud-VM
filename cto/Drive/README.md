# Drive

Long-lived artifacts: architecture diagrams, exported PDFs, slide decks, and reference copies.

## Current state

**Empty scaffold.** Store only non-secret material suitable for Git.

## Do not commit

- `.env`, API keys, tokens, private keys
- Customer PII beyond initials
- Large binaries without Git LFS (prefer links)

## Suggested layout

```
Drive/
├── diagrams/     # mermaid exports, PNG architecture
├── specs/        # ADRs, RFCs
└── exports/      # sanitized Obsidian / Notion exports
```

When mirroring from the local Mac vault, rsync with excludes — see [`../HOME.md`](../HOME.md).
