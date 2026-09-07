# Drive

Human ↔ agent **exchange** — not the Git SoT for code or Claudio decisions.

**Folder:** https://drive.google.com/drive/folders/1a7jcTmgaNs66aoedht-lI1u4vNQPwaNu

## Contract

Full layout, current inventory, and manifest rules: [`exchange-folder-contract.md`](exchange-folder-contract.md)

```
00-Inbox → 10-Clients / 20-Research → 30-Deliverables → 90-Archive
```

**Inbox until reviewed.** No credentials in any folder. Drive is **not** live OpenClaw/Hermes state.

## Git mirror rule

Only promote **`30-Deliverables`** and approved research summaries to Nest Git. Exclude `00-Inbox` from rsync — see [`../HOME.md`](../HOME.md).

## Do not commit

- `.env`, API keys, tokens, private keys
- Customer PII beyond initials
- Unreviewed inbox drops
