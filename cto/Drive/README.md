# Drive

Human ↔ agent **exchange** — not the Git SoT for code or Claudio decisions.

## Contract

Full folder proposal: [`exchange-folder-contract.md`](exchange-folder-contract.md)

```
00-Inbox → 10-Working → 20-Review → 30-Published → 40-Knowledge / 90-Archive
```

**Inbox until reviewed.** No credentials in any folder.

## Git mirror rule

Only promote **`30-Published`** and above to Nest Git. Exclude `00-Inbox` from rsync — see [`../HOME.md`](../HOME.md).

## Do not commit

- `.env`, API keys, tokens, private keys
- Customer PII beyond initials
- Unreviewed inbox drops
