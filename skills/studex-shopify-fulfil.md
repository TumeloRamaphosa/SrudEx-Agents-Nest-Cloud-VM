---
name: studex-shopify-fulfil
description: "Mark StudEx Meat Shopify orders as fulfilled, bulk fulfil with tracking numbers, and manage the unfulfilled order pipeline. Use when asked to fulfil order #XXXX, mark as delivered, process fulfilments, or audit the R127k unfulfilled pipeline."
metadata:
  author: robusca
  version: '1.0'
  business: StudEx Meat
  last_updated: '2026-06-15'
---

# StudEx Shopify Fulfilment Skill

## When to Use This Skill

Load this skill when Tumelo asks to:
- Fulfil a specific order by number
- Mark orders as delivered
- Bulk fulfil a batch of orders
- Check the unfulfilled pipeline
- Add tracking information to an order

**Trigger phrases:** "fulfil order #XXXX", "mark as delivered", "fulfil all paid orders", "check unfulfilled pipeline", "what orders need fulfilment"

## Store Details

```
Store:    studexmeat.myshopify.com
Source:   shopify connector (source_id: shopify)
Currency: ZAR (South African Rand, R prefix)
```

## Critical Pipeline Context

- **Unfulfilled pipeline (as of Jun 15 2026):** 40 orders = R127,425.15
- **Oldest unfulfilled:** #1227
- **Newest unfulfilled:** #1949
- Orders #1922, #1930, #1911 — confirmed delivered by Tumelo, not yet recorded in Shopify
- **Always check with Tumelo before mass-fulfilling** — some orders may already be delivered

## Privacy Rules (MANDATORY)

- Customer names: **INITIALS ONLY** in all logs, reports, notifications
- All monetary values: **R prefix** (e.g. R1,250.00)
- Never display full customer name in any output

## Step 1: Pull Unfulfilled Orders

Use the Shopify connector:

```
Tool: list-orders
Source: shopify
Parameters:
  financial_status: paid
  fulfillment_status: unfulfilled
  limit: 250
```

Returns: Order number, customer initials, line items, total, created_at

## Step 2: Fulfil a Single Order

### Via Shopify Connector

```
Tool: fulfil-order (or create-fulfillment)
Source: shopify
Parameters:
  order_id: <order_id>
  tracking_number: <tracking_number_if_available>
  tracking_company: "Other"  (or "Paxi", "PostNet", "DHL")
  notify_customer: true
```

### Via Shopify Admin API (direct)

```bash
# First get the fulfillment order ID
curl -X GET \
  "https://studexmeat.myshopify.com/admin/api/2024-01/orders/{order_id}/fulfillment_orders.json" \
  -H "X-Shopify-Access-Token: ${SHOPIFY_ACCESS_TOKEN}"

# Then create the fulfillment
curl -X POST \
  "https://studexmeat.myshopify.com/admin/api/2024-01/fulfillments.json" \
  -H "X-Shopify-Access-Token: ${SHOPIFY_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "fulfillment": {
      "line_items_by_fulfillment_order": [
        { "fulfillment_order_id": <fo_id> }
      ],
      "tracking_info": {
        "number": "<tracking_number>",
        "company": "PostNet"
      },
      "notify_customer": true
    }
  }'
```

## Step 3: Bulk Fulfilment Workflow

```
1. Pull all paid+unfulfilled orders
2. Show Tumelo the list (initials + order # + value)
3. Wait for Agent Lord approval before proceeding
4. Fulfil each in sequence (or in parallel if no tracking numbers)
5. Log each fulfilment to cron_tracking/fulfilments/YYYY-MM-DD.md
6. Send summary notification
```

**NEVER bulk-fulfil without Tumelo's explicit approval.**

## Tracking Companies Supported by Shopify

| Company | Code |
|---|---|
| Paxi | Paxi |
| PostNet | PostNet |
| DHL Express | DHL Express |
| Courier Guy | The Courier Guy |
| Aramex | Aramex |
| Other | Other |

## Log Format

Write fulfilment logs to `/home/user/workspace/cron_tracking/fulfilments/YYYY-MM-DD.md`:

```markdown
# Fulfilment Log — {date}
Processed by: Robusca | {time} SAST

## Orders Fulfilled
| Order # | Customer | Value | Tracking | Status |
|---|---|---|---|---|
| #1234 | T.R. | R450.00 | TRK123456 | ✅ Fulfilled |
| #1235 | S.M. | R890.00 | — | ✅ Fulfilled (no tracking) |

## Summary
Total orders fulfilled: {n}
Total value: R{amount}
Agent Lord approval: ✅ Confirmed at {time}
```

## Inventory Warning Integration

Before fulfilling, cross-check with known negative stock SKUs:
- Wagyu Beef Burger Patties (1kg): **-249 units** ⚠️ CRITICAL
- Tomahawk 1kg: **-213 units** ⚠️ CRITICAL
- Tomahawk 2kg: **-71 units** ⚠️ HIGH
- Luxury Wagyu Biltong 1kg: **-220 units** ⚠️ CRITICAL
- Luxury Wagyu Biltong 500g: **-81 units** ⚠️ HIGH
- VIP Large Wagyu Box: **-15 units** ⚠️ HIGH
- Ankole Ribeye 1kg: 1 available, 11 committed ⚠️ OVERSOLD

If an order contains a negative-stock SKU, flag it to Tumelo before fulfilling.

## Notification After Fulfilment

```
Title: Orders Fulfilled — {date}
Body: {n} orders fulfilled | R{total} | Oldest cleared: #{oldest_order}
```

## Related Skills

- `studex-inventory-audit` — check stock before fulfilling
- `studex-morning-brief` — morning pipeline summary includes unfulfilled count
- `robusca-memory-sync` — log fulfilment summary to session memory
