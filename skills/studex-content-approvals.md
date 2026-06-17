---
name: studex-content-approvals
description: "Review, approve, or reject pending StudEx Meat content before publishing. Push approved content to War Room queue. Use when asked to approve content, review posts, check approvals queue, or manage content workflow for Instagram, Facebook, or WhatsApp."
metadata:
  author: robusca
  version: '1.0'
  business: StudEx Meat
  last_updated: '2026-06-15'
---

# StudEx Content Approvals Skill

## When to Use This Skill

Load this skill when Tumelo asks to:
- Approve or reject a piece of content
- Review pending posts before publishing
- Check the approvals queue
- Push approved content to War Room
- Bulk approve content for a campaign

**Trigger phrases:** "approve content", "content approval", "review posts", "approve [post name]", "what needs approval", "show me the queue"

## CRITICAL RULE — NEVER POST WITHOUT APPROVAL

```
⚠️  ROBUSCA MUST NEVER POST ANY CONTENT WITHOUT EXPLICIT AGENT LORD APPROVAL
⚠️  This applies to: Instagram, Facebook, WhatsApp, LinkedIn, Threads, any platform
⚠️  Even if content is "approved" in War Room — wait for verbal/written go-ahead
⚠️  Approved = queued for review, NOT permission to post
```

## Approval Workflow

### Step 1 — Check Pending Content

Pull pending items from War Room database:
```
GET /api/content?status=pending
GET /api/content?status=draft
```

Or list from the `content/` directory in robusca-brain.

### Step 2 — Present to Agent Lord

For each pending item, show:
```
📋 PENDING APPROVAL — [Post Name]
Platform: Instagram / Facebook / WhatsApp
Type: Reel / Static / Story / Carousel
Caption: [first 100 chars...]
Status: AWAITING APPROVAL
Assets: [image filenames]
---
Approve? (yes / no / edit)
```

### Step 3 — Record Decision

**If approved:**
```
- Set status = "approved" in War Room DB
- POST /api/content/{id}/approve
- Record: approved_by: "Agent Lord", approved_at: <timestamp>
- Notify: "✅ [Post Name] approved — scheduled for [platform]"
- DO NOT POST — queue only
```

**If rejected:**
```
- Set status = "rejected" in War Room DB
- POST /api/content/{id}/reject
- Log reason if provided
- Notify: "❌ [Post Name] rejected"
```

**If edits needed:**
```
- Set status = "needs_edit"
- Record edit instructions
- Reassign to content queue
```

### Step 4 — Post Only When Tumelo Confirms

After approval, Tumelo must explicitly say:
- "Post it now"
- "Go ahead and post"
- "Send it"

Until then, content stays in "approved" status — never auto-posts.

## Current Content Awaiting Approval (as of Jun 15 2026)

| Content | Platform | Status | Notes |
|---|---|---|---|
| Father's Day Tomahawk Hero | Instagram | DRAFT | Jun 15 — TODAY, needs urgent decision |
| Youth Day Braai Hero | Instagram | DRAFT | Jun 16 — tomorrow |
| Youth Day YOUTH16 promo | All platforms | DRAFT | LOCKED — needs separate activation |
| Global Markets Russia Partnership | Instagram + LinkedIn | DRAFT | —  |
| Order Today Deliver Tomorrow | Instagram | DRAFT | — |
| Global Markets Blog | Website + LinkedIn | DRAFT | Russia cohort blog |

**Stock warning before approving Tomahawk content:** Tomahawk 1kg = -213 units. Confirm stock before activating.

## War Room Approvals Tab

- URL: https://www.perplexity.ai/computer/a/studex-war-room-vLlaaCxbTSKY9W6ammcqNQ
- Navigate to: Approvals tab
- Shows: all content in draft/pending state with approve/reject buttons

## Content Categories

### Instagram / Facebook Posts
- Check: caption, hashtags, image quality, correct branding
- Verify: no price errors, no stock issues for featured product
- Ensure: StudEx logo present, Wagyu quality claims accurate

### WhatsApp Blasts
- Use `studex-meta-whatsapp` skill after approval
- Maximum blast size: requires confirmation from Tumelo
- Template messages only for first-time contacts (Meta 24h rule)

### Reel / Video Content
- Check: watermark present, correct aspect ratio (9:16 for Reels)
- Verify: audio license cleared (or original audio only)
- Caption + cover frame both approved

### Campaign Promos (YOUTH16, discount codes)
- Requires: stock check before activation
- Requires: explicit "activate promo" command from Tumelo
- Lock: do not post until promo code is live in Shopify

## Logging Approvals

Write to `/home/user/workspace/cron_tracking/approvals/YYYY-MM-DD.md`:

```markdown
# Approvals Log — {date}
Agent: Robusca | {time} SAST

## Approved
- [Post Name] — approved at {time} — pending post command

## Rejected
- [Post Name] — rejected at {time} — reason: {reason}

## Still Pending
- [Post Name] — awaiting decision
```

## Related Skills

- `studex-meta-whatsapp` — execute WhatsApp blast post-approval
- `studex-morning-brief` — morning brief includes pending approval count
- `studex-inventory-audit` — check stock before approving product-featured content
