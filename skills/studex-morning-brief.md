---
name: studex-morning-brief
description: "Generate a single formatted morning brief for Tumelo Ramaphosa pulling live data from Shopify, Gmail, AgentMail, Google Ads, and Facebook Ads. Use when asked for morning report, morning brief, daily briefing, or what needs attention today."
metadata:
  author: robusca
  version: '1.0'
  business: StudEx Group
  last_updated: '2026-06-15'
---

# StudEx Morning Brief Skill

## When to Use This Skill

Load this skill when Tumelo says:
- "Morning report"
- "Morning brief"
- "Daily briefing"
- "What needs attention today?"
- "Give me my brief"
- "What's happening today?"

Also auto-triggered as part of the daily morning routine at 08:30 SAST.

## Output Format

Produce a single concise brief in this exact format:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🗓  STUDEX MORNING BRIEF — {DATE} {TIME} SAST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 SHOPIFY
   New orders (last 24h): {n} | R{revenue}
   Unfulfilled pipeline:  {count} orders | R{total}
   Oldest unfulfilled:    #{order_number}
   ⚠️  Stock alerts:       {list critical SKUs or "All clear"}

📧 COMMS
   Gmail (tumelor001@gmail.com): {unread} unread
   AgentMail (studex-2571):      {unread} unread
   ⚡ Urgent:                    {flag if any action-required email}

📣 CONTENT QUEUE
   Pending approval: {n} posts
   Scheduled today:  {n} posts
   ⚠️  Urgent:         {flag time-sensitive content e.g. Youth Day}

📊 ADS
   Google Ads (PMAX): Status: {active/paused} | Yesterday spend: R{amount}
   Facebook Ads:      Status: {active/paused} | Yesterday spend: R{amount}
   Combined ROAS:     {ratio} (if available)

🎯 TOP 3 PRIORITIES TODAY
   1. {highest urgency action}
   2. {second priority}
   3. {third priority}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Robusca | Chief of Staff | StudEx Group
War Room: https://www.perplexity.ai/computer/a/studex-war-room-vLlaaCxbTSKY9W6ammcqNQ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Data Sources — Pull in This Order

### 1. Shopify (source_id: shopify)

```
list-orders: financial_status=paid, created_at_min=yesterday 00:00 SAST
list-orders: financial_status=paid, fulfillment_status=unfulfilled (pipeline)
get-inventory: [Wagyu Burger Patties, Tomahawk 1kg, Biltong 1kg, VIP Box, Ankole Ribeye]
```

### 2. Gmail (gcal connector or google connector)

```
search_email: query="is:unread", limit=10
Flag: anything with "urgent", "order", "invoice", "customer complaint"
```

### 3. AgentMail

```
GET https://api.agentmail.to/v0/inboxes/studex-2571@agentmail.to/threads
Authorization: Bearer am_us_057fa690742140538d210a530fdfc0018f21c61e08b691d2fddcee0152b60005
Flag: unread count
```

### 4. Google Ads (google_ads__pipedream connector)

```
Account: 2234319068
Pull: yesterday campaign performance (spend, clicks, conversions)
Flag: any campaigns paused or budget exhausted
```

### 5. Facebook Ads (facebook_pages__pipedream connector)

```
Ad Account: act_560666565541381
Pull: yesterday ad spend + results
Flag: any campaigns with 0 delivery
```

## Top 3 Priority Logic

Robusca calculates the top 3 in this order:

1. **Unfulfilled paid orders** — if any exist, fulfilment is always top priority
2. **Time-sensitive content** — if today has a campaign going live (Father's Day, Youth Day, promos)
3. **Negative stock SKUs** — flag if any critical products have negative inventory
4. **Urgent emails/messages** — customer complaints or supplier issues
5. **Ad campaign issues** — any campaign paused, budget exhausted, or ROAS below 1.5

## Privacy Rules

- Customer names: **INITIALS ONLY**
- Phone numbers: **LAST 4 DIGITS ONLY**
- All monetary values: **R prefix + font-mono style in War Room**

## Fallback Behaviour

If a data source is unavailable:
```
📦 SHOPIFY — ⚠️ Could not fetch (connector error)
```

Never fail silently. Always show which sources succeeded and which failed.

## Morning Routine Integration

This skill feeds into the daily morning routine defined in `protocols/morning-routine.md`:
- **08:30 SAST** — run this skill
- **09:00 SAST** — Tumelo reviews brief and decides top 3
- War Room URL always included in footer

## Notification Option

After generating the brief, offer:
"Send this as a push notification?" → uses send_notification with channels: ["push"]

## Related Skills

- `studex-shopify-fulfil` — act on unfulfilled orders flagged in brief
- `studex-content-approvals` — act on content queue flagged in brief
- `studex-ads-manager` — deeper ads analysis if brief flags issues
- `studex-inventory-audit` — full inventory audit if brief flags stock issues
- `robusca-memory-sync` — write brief summary to session memory
