---
name: studex-inventory-audit
description: "Audit StudEx Meat Shopify inventory, flag negative stock SKUs, suggest correction values, and track inventory health. Use when asked to check stock, inventory audit, negative stock, check inventory, or SKU levels."
metadata:
  author: robusca
  version: '1.0'
  business: StudEx Meat
  last_updated: '2026-06-15'
---

# StudEx Inventory Audit Skill

## When to Use This Skill

Load this skill when Tumelo asks:
- "Inventory audit"
- "Check stock"
- "What's the stock situation?"
- "Negative stock report"
- "Check inventory for [product]"
- Any question about stock levels

**Trigger phrases:** "inventory audit", "check stock", "negative stock", "SKU levels", "what's in stock"

## Store Details

```
Store:     studexmeat.myshopify.com
Connector: shopify (source_id: shopify)
Currency:  ZAR (R prefix)
```

## Known Critical SKUs (as of Jun 15 2026)

| SKU / Product | Available | Committed | Net | Status |
|---|---|---|---|---|
| Wagyu Beef Burger Patties (1kg) | Unknown | Unknown | **-249** | 🔴 CRITICAL |
| Tomahawk 1kg | Unknown | Unknown | **-213** | 🔴 CRITICAL |
| Tomahawk 2kg | Unknown | Unknown | **-71** | 🟠 HIGH |
| Luxury Wagyu Biltong 1kg | Unknown | Unknown | **-220** | 🔴 CRITICAL |
| Luxury Wagyu Biltong 500g | Unknown | Unknown | **-81** | 🟠 HIGH |
| VIP Large Wagyu Box | Unknown | Unknown | **-15** | 🟠 HIGH |
| Ankole Ribeye 1kg | 1 | 11 | **-10** | 🟠 OVERSOLD |

These have been negative for multiple consecutive days — escalate to Tumelo.

## Audit Procedure

### Step 1 — Pull Live Inventory

```
Tool: get-inventory-levels (or list-inventory-items)
Source: shopify
Parameters:
  location_id: <default_location>
```

Or check specific products:
```
Tool: get-product
Source: shopify
Parameters:
  product_ids: [Wagyu Burger Patties, Tomahawk, Wagyu Biltong, Ankole Ribeye, VIP Large Wagyu Box]
  fields: variants.inventory_quantity, variants.inventory_item_id
```

### Step 2 — Classify by Severity

| Severity | Condition | Action |
|---|---|---|
| 🔴 CRITICAL | qty < -100 OR (qty < 0 AND orders committed > 10) | Immediate flag to Tumelo |
| 🟠 HIGH | -100 ≤ qty < -10 | Flag in morning brief |
| 🟡 LOW | -10 ≤ qty < 0 | Monitor |
| 🟢 OK | qty ≥ 0 AND committed < 80% of available | All clear |
| ⚪ OUT | qty = 0 | Flag if not intentionally discontinued |

### Step 3 — Generate Report

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 STUDEX INVENTORY AUDIT — {DATE} {TIME} SAST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 CRITICAL (negative > -100)
  Wagyu Burger Patties 1kg:  -249  ← needs immediate restock
  Tomahawk 1kg:              -213  ← check with supplier
  Luxury Wagyu Biltong 1kg:  -220  ← check with supplier

🟠 HIGH (negative -10 to -100)
  Tomahawk 2kg:              -71
  Wagyu Biltong 500g:        -81
  VIP Large Wagyu Box:       -15
  Ankole Ribeye 1kg:         -10 (1 available, 11 committed)

🟢 CLEAR
  {list products with healthy stock}

━━━━━━━━━━━━━━━━━━━━━━━━━
SUGGESTED CORRECTIONS
  Wagyu Burger Patties: Set inventory to 0 or update to actual count
  Tomahawk:             Update to reflect physical stock on hand
  Note: Corrections must be approved by Tumelo before applying
━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 4 — Suggest Corrections

Robusca NEVER applies inventory corrections autonomously. Present corrections as options:

```
Suggested action for [SKU]:
A) Set to 0 (stop overselling)
B) Set to [actual_physical_count] (requires Tumelo to confirm physical count)
C) Enable "Continue selling when out of stock" (conscious decision)
D) Deactivate product listing temporarily

→ Agent Lord approval required before any action
```

## How to Apply a Correction (after approval)

### Via Shopify connector:
```
Tool: update-inventory-level
Source: shopify
Parameters:
  inventory_item_id: <item_id>
  location_id: <location_id>
  available: <new_count>
```

### Via Shopify Admin API:
```bash
curl -X POST \
  "https://studexmeat.myshopify.com/admin/api/2024-01/inventory_levels/set.json" \
  -H "X-Shopify-Access-Token: ${SHOPIFY_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "location_id": <location_id>,
    "inventory_item_id": <item_id>,
    "available": <new_count>
  }'
```

## Content Approval Integration

Before approving any content that features a product, cross-reference this audit:
- If product has negative stock → warn in approval flow
- Do not approve ads/content for products with -50 or worse stock without Tumelo confirmation

## Log Format

Write to `/home/user/workspace/cron_tracking/inventory/YYYY-MM-DD.md`:

```markdown
# Inventory Audit — {date}
Generated: Robusca | {time} SAST

## Summary
Critical SKUs: {n}
High risk SKUs: {n}
All-clear SKUs: {n}

## Critical
{table}

## Corrections Applied
{none / list approved corrections}
```

## Related Skills

- `studex-shopify-fulfil` — check inventory before fulfilling orders
- `studex-content-approvals` — inventory warning integrated into content approval
- `studex-morning-brief` — inventory summary included in morning brief
