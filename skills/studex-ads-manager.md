---
name: studex-ads-manager
description: "Pull Google Ads and Facebook Ads performance for StudEx Meat, suggest budget adjustments, and track campaign ROI. Use when asked for ads report, check ads, Facebook campaign performance, Google PMAX results, or ad spend analysis."
metadata:
  author: robusca
  version: '1.0'
  business: StudEx Meat
  last_updated: '2026-06-15'
---

# StudEx Ads Manager Skill

## When to Use This Skill

Load this skill when Tumelo asks:
- "Ads report"
- "Check ads" / "How are the ads doing?"
- "Facebook campaign performance"
- "Google PMAX results"
- "Ad spend this week"
- "Should we adjust the budget?"
- "Are the ads running?"

**Trigger phrases:** "ads report", "check ads", "Facebook ads", "Google ads", "campaign performance", "ROAS"

## Platform Credentials

### Google Ads
- **Account ID:** `2234319068`
- **Connector:** `google_ads__pipedream`
- **Campaign type:** PMAX (Performance Max)

### Facebook / Meta Ads
- **Ad Account:** `act_560666565541381`
- **App ID:** `1649681979685968`
- **Page:** StudEx Meat (ID: 108934711902801)
- **Instagram:** @studexmeat (ID: 17841403538967823)
- **Connector:** `facebook_pages__pipedream`

## Standard Report Format

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 STUDEX ADS REPORT — {DATE RANGE}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GOOGLE ADS (PMAX)
Account: 2234319068
Period:  {yesterday / last 7 days / this month}
──────────────────────────────────
Impressions:   {n}
Clicks:        {n}
CTR:           {%}
Spend:         R{amount}
Conversions:   {n}
Conv. Value:   R{amount}
ROAS:          {ratio}x
Status:        {Active / Paused / Budget Limited}

FACEBOOK / INSTAGRAM ADS
Ad Account: act_560666565541381
Period:  {same range}
──────────────────────────────────
Reach:         {n}
Impressions:   {n}
Spend:         R{amount}
Clicks:        {n}
CTR:           {%}
Results:       {n} ({result type})
Cost/Result:   R{amount}
Status:        {Active / Paused}

COMBINED SUMMARY
Total spend:  R{google + facebook}
Est. ROAS:    {ratio}x
Recommendation: {see below}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Pulling Google Ads Data

Use the `google_ads__pipedream` connector:

```
Tool: get-campaign-performance (or report)
Parameters:
  account_id: 2234319068
  date_range: YESTERDAY | LAST_7_DAYS | THIS_MONTH
  metrics: impressions, clicks, ctr, cost, conversions, conversion_value, roas
```

If connector unavailable, use Google Ads API directly:
```bash
# Requires OAuth token from google_ads__pipedream
curl "https://googleads.googleapis.com/v16/customers/2234319068/googleAds:search" \
  -H "Authorization: Bearer ${GOOGLE_ADS_TOKEN}" \
  -H "developer-token: ${GOOGLE_ADS_DEV_TOKEN}" \
  -d '{
    "query": "SELECT campaign.name, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions, metrics.conversions_value FROM campaign WHERE segments.date DURING YESTERDAY"
  }'
```

## Pulling Facebook Ads Data

Use the `facebook_pages__pipedream` connector or Graph API:

```bash
curl "https://graph.facebook.com/v19.0/act_560666565541381/insights" \
  -H "Authorization: Bearer ${META_ACCESS_TOKEN}" \
  -d "fields=impressions,reach,spend,clicks,ctr,actions,cost_per_action_type" \
  -d "date_preset=yesterday"
```

## Budget Recommendation Logic

Robusca recommends adjustments based on:

| Condition | Recommendation |
|---|---|
| ROAS > 3.0 | Increase budget by 20% |
| ROAS 1.5–3.0 | Maintain current budget |
| ROAS 1.0–1.5 | Monitor — pause underperforming ad sets |
| ROAS < 1.0 | Pause campaign — review creative and audience |
| CTR < 1% | Test new creative/copy |
| Budget limited | Increase daily budget or pause low-ROAS campaigns |

**Important:** Always present recommendation to Tumelo. Never adjust budgets autonomously.

## Active Campaigns Context

### Father's Day Campaign (Jun 15 2026 — TODAY)
- Platform: Facebook + Instagram
- Creative: Tomahawk hero image + copy
- Promo: No discount code (standard pricing)
- Status: DRAFT — check if Tumelo activated

### Youth Day Campaign (Jun 16 2026)
- Platform: Instagram + Facebook
- Promo: YOUTH16 discount code
- Status: DRAFT / LOCKED — activation needed

### Google PMAX
- Always-on performance campaign
- Targets: Johannesburg + Gauteng premium food buyers
- Products: All active Shopify inventory

## Logging

Write ad reports to `/home/user/workspace/cron_tracking/ads/YYYY-MM-DD.md` in the standard format above.

## Meta CLI Usage

```bash
# Load credentials
source ~/.studex/meta.env

# List ad campaigns
python3 -c "
from facebook_business.api import FacebookAdsApi
from facebook_business.adobjects.adaccount import AdAccount
FacebookAdsApi.init(access_token='${META_ACCESS_TOKEN}')
account = AdAccount('act_560666565541381')
campaigns = account.get_campaigns(fields=['name','status','daily_budget'])
for c in campaigns: print(c)
"
```

## Related Skills

- `studex-morning-brief` — daily brief includes ads summary
- `studex-content-approvals` — approve content before launching ad campaigns
- `studex-meta-whatsapp` — WhatsApp blast to retarget customers
