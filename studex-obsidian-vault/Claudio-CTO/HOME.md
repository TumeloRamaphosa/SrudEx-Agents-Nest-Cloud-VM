---
type: cto-dashboard
owner: Claudio-CTO
status: active
---

# Claudio-CTO

This folder is the human-readable control plane for StudEx agents and infrastructure.

## Operating map

- [[Systems/Current System Map]] — what runs locally, in containers, and in the cloud
- [[Automations/Schedule]] — authoritative automation schedule and known failures
- [[Skills/Solo Founder Skills]] — approved business uses for the solo-founder skill pack
- [[Drive/Shared Agent Files]] — Google Drive exchange-layer inventory and rules
- `Reports/` — six-hour generated system snapshots
- `Decisions/` — architecture and operating decisions
- `Inbox/` — unreviewed agent outputs

## Source-of-truth rules

1. Git repositories hold code and executable configuration.
2. Claudio-CTO holds decisions, schedules, reports, and operating context.
3. Google Drive is the exchange layer for large or collaborative business files.
4. Credentials never belong in Obsidian, Drive reports, or Git.
5. Generated work enters `Inbox` and becomes authoritative only after review.
