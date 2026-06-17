# AgentMail Setup — send.studexmeat.com

## Status: ✅ DNS RECORDS ADDED (pending verification)

## What Was Configured

| Record | Subdomain | Purpose |
|--------|-----------|---------|
| MX | send.studexmeat.com | AgentMail inbound receiving |
| TXT | agentmail._domainkey.send | DKIM signing |
| SPF | mail.send.studexmeat.com | SES outbound |
| MX | mail.send.studexmeat.com | SES bounce feedback |
| DMARC | _dmarc.send.studexmeat.com | DMARC policy |

## SPF Fix Required
**Current:** `v=spf1 include:amazonses.com ~all`
**Change to:** `v=spf1 include:amazonses.com -all`

~all = softfail (accepts spoofed mail)
-all = hardfail (rejects spoofed mail) ← CORRECT

---

## Verified Domains + Inboxes

| Address | Agent | Status |
|---------|-------|--------|
| charlie@agent.studexmeat.com | Charlie orchestrator | ✅ Active |
| naledi@agent.studexmeat.com | Naledi CMO | ✅ Active |
| ceo@agent.studexmeat.com | Robusca | ✅ Active |
| ops@agent.studexmeat.com | Ops agent | 🔄 Pending |
| hermes@agent.studexmeat.com | DevOps | 🔄 Pending |

---

## How It Works

1. Email sent to `naledi@agent.studexmeat.com`
2. AgentMail webhook fires → OpenClaw session
3. Agent reads, reasons, responds
4. Reply sent back from same inbox (threaded)

---

## Next Steps

- [ ] Fix SPF to `-all`
- [ ] Verify domain in AgentMail console
- [ ] Create remaining inboxes
- [ ] Test sending + receiving

---
*Last updated: 2026-06-17*
