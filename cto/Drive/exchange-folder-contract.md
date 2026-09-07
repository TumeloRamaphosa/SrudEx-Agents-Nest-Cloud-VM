# Drive — Exchange Folder Contract

**Purpose:** Human ↔ agent file exchange without polluting Git or Obsidian decision docs.  
**Folder:** https://drive.google.com/drive/folders/1a7jcTmgaNs66aoedht-lI1u4vNQPwaNu  
**Connected identity (audit):** `tumelor001@gmail.com`  
**Rule:** No credentials in any folder. **Inbox until reviewed.**

**Hard rule:** Google Drive is **not** the live OpenClaw or Hermes state directory. Databases, sessions, locks, and credentials remain **outside** Drive.

---

## Current inventory (2026-09-03 audit)

The shared folder contains **13 top-level subfolders**. Most are empty at audit time.

### Populated

| Path | Contents (audit) |
|------|------------------|
| `Linux/` | 9 items — setup notes, USB bundle, dashboard, Arch ISO |
| `Founder Docs/Founder` | Founder documents |
| `Coffee/Cafe Noir` | Cafe Noir materials |
| `Kimi Working/Contet launch` | Content launch work |
| `Kimi Working/D-Day` | D-Day materials |

### Empty at audit

`Kilo-Stud-LLM-CHIEF`, `Content`, `Linux Chief`, `AntiGravity OS`, `Mac OpenClaw Adam Smasher`, `Soloprenure`, `AUTO`, `SuperAgents`, `Dark`

Physical layout may drift until the proposed contract below is applied on Drive.

---

## Proposed contract layout

```
Drive/
├── 00-Inbox/<agent>/<run-id>/     ← unreviewed uploads; never authoritative
├── 10-Clients/<client-id>/       ← collaborative client files
├── 20-Research/<project-id>/     ← Warmwind and research artifacts
├── 30-Deliverables/<client-id>/  ← approved outputs
└── 90-Archive/                   ← cold material and installation media
```

### Upload manifest (required per agent drop)

Each agent upload under `00-Inbox/` should include a small manifest (JSON or YAML) with:

| Field | Description |
|-------|-------------|
| `task_id` | Linked task or ticket |
| `agent` | Agent identity that produced the upload |
| `client` | Client ID if applicable |
| `source` | Origin system (OpenClaw run, human, cron, etc.) |
| `timestamp` | ISO-8601 upload time |
| `sensitivity` | `public` / `internal` / `client-confidential` |
| `obsidian_note` | Related Claudio-CTO note path (if any) |

---

## Promotion workflow

```
00-Inbox → 10-Clients or 20-Research → 30-Deliverables
                ↓                              ↓
           90-Archive (cold / superseded / install media)
```

| Transition | Who | Criteria |
|------------|-----|----------|
| → `00-Inbox` | Anyone / any agent | Raw drop; may be wrong or duplicate |
| → `10-Clients` | Claudio or human | Triage complete; client-scoped collaboration |
| → `20-Research` | Claudio or human | Research / Warmwind artifacts; not client-deliverable yet |
| → `30-Deliverables` | **Human only** | Approved for client or operational use |
| → `90-Archive` | Claudio | Superseded, cold storage, or disk pressure (see below) |

---

## Folder rules

| Folder | Git in Nest? | Retention |
|--------|--------------|-----------|
| `00-Inbox` | **No** — exclude from rsync to Nest | Clear weekly |
| `10-Clients` | Selective PRs only — sanitized | Until project complete |
| `20-Research` | Selective PRs only | Until promoted or archived |
| `30-Deliverables` | Yes — sanitized | Long-lived |
| `90-Archive` | Optional | Until volume recovery |

---

## Proposal status

This contract is a **proposal mirrored from Claudio-CTO** — physical folders on Drive may not match yet. Create or remap on Drive first; mirror only `30-Deliverables` and approved research summaries to Nest Git.

---

## Disk pressure (2026-09-03)

Internal Data volume **97% used** (~31 Gi available) — prioritize:

1. Move stale inbox and scratch material → `90-Archive` or delete
2. Prune large exports and duplicate install media in `90-Archive`
3. Do **not** archive `.openclaw` into Drive — handle in OpenClaw session cleanup instead
