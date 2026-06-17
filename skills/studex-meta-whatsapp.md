---
name: studex-meta-whatsapp
description: "Send WhatsApp messages, broadcast templates, and order confirmations via Meta Cloud API for StudEx Meat. Use when asked to send a WhatsApp blast, WhatsApp message to customers, order confirmation, Father's Day / Youth Day campaign, or any WhatsApp communication on behalf of StudEx."
metadata:
  author: robusca
  version: '1.0'
  business: StudEx Meat
  last_updated: '2026-06-15'
---

# StudEx Meta WhatsApp Skill

## When to Use This Skill

Load this skill when Tumelo asks to:
- Send a WhatsApp message or blast to customers
- Send an order confirmation via WhatsApp
- Broadcast a campaign (Father's Day, Youth Day, promo codes)
- Test the WhatsApp connection or check phone number status
- Register or retrieve WhatsApp Phone Number ID / WABA ID

**Trigger phrases:** "send WhatsApp blast", "WhatsApp message to customers", "confirm order via WhatsApp", "send promo on WhatsApp"

## StudEx WhatsApp Credentials

```
App ID:           1649681979685968
Store Number:     +27 27 949 8737
Page ID:          108934711902801
Ad Account:       act_560666565541381
```

**CRITICAL — Still needed before sending:**
- Phone Number ID — retrieve from Meta Developer Console
- WABA ID (WhatsApp Business Account ID) — retrieve from Meta Developer Console
- Permanent System User Token — generate at business.facebook.com/settings/system-users

**Where to get them:**
1. Phone Number ID + WABA ID → https://developers.facebook.com/apps/1649681979685968/whatsapp-business/wa-dev-console
2. Permanent token → https://business.facebook.com/settings/system-users → Create "Robusca-Agent" System User → Assign WABA → Generate token with scopes: `whatsapp_business_messaging` + `whatsapp_business_management` → Never expiry

Store credentials in: `~/.studex/meta.env`

```bash
# ~/.studex/meta.env
META_ACCESS_TOKEN=<permanent_system_user_token>
WHATSAPP_PHONE_NUMBER_ID=<phone_number_id>
WHATSAPP_BUSINESS_ACCOUNT_ID=<waba_id>
META_APP_ID=1649681979685968
STORE_WHATSAPP=+27279498737
```

## Meta CLI Installation

```bash
pip3 install facebook_business   # v25.0.2 — official Meta Marketing API SDK
pip3 install meta-ads-cli        # v0.1.0 — third-party CLI for Meta Ads
```

Note: `pip3 install meta-ads` does NOT exist — always use the two packages above.

## Sending a WhatsApp Message

### 1. Send a single text message

```bash
curl -X POST \
  "https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_NUMBER_ID}/messages" \
  -H "Authorization: Bearer ${META_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "27XXXXXXXXX",
    "type": "text",
    "text": { "body": "Your message here" }
  }'
```

### 2. Send a template message (approved templates only)

```bash
curl -X POST \
  "https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_NUMBER_ID}/messages" \
  -H "Authorization: Bearer ${META_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "27XXXXXXXXX",
    "type": "template",
    "template": {
      "name": "order_confirmation",
      "language": { "code": "en_ZA" },
      "components": [
        {
          "type": "body",
          "parameters": [
            { "type": "text", "text": "{{order_number}}" },
            { "type": "text", "text": "{{customer_name}}" }
          ]
        }
      ]
    }
  }'
```

### 3. List approved message templates

```bash
curl "https://graph.facebook.com/v19.0/${WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates" \
  -H "Authorization: Bearer ${META_ACCESS_TOKEN}"
```

## Campaign Templates

### Father's Day / Youth Day Blast
Use template: `fathers_day_special` or create inline text message

```python
# Python script for bulk blast using facebook_business SDK
from facebook_business.api import FacebookAdsApi
from facebook_business.adobjects.adaccount import AdAccount

# Initialise
FacebookAdsApi.init(access_token='<META_ACCESS_TOKEN>')
# Then use WhatsApp Cloud API endpoint for each recipient
```

### Order Confirmation Template

Variables: `{{1}}` = Order number, `{{2}}` = First name, `{{3}}` = Delivery date
Message: "Hi {{2}}, your StudEx order {{1}} is confirmed and will arrive {{3}}. Track it here: studexmeat.com/track"

## Number Format Rules

- Always use international format without `+`: `27XXXXXXXXX`
- South African numbers: `27` prefix + 9 digits (drop leading 0 from local number)
- Example: `0821234567` → `27821234567`

## Privacy Rules (CRITICAL)

- Customer names: INITIALS ONLY in logs and notifications
- Phone numbers: LAST 4 DIGITS ONLY in logs
- Never store customer WhatsApp numbers in plain text outside of `.env`

## Workflow Before First Send

1. Retrieve Phone Number ID from dev console
2. Store in `~/.studex/meta.env`
3. Generate permanent System User token
4. Test with a single message to Tumelo's number first
5. Get Agent Lord approval before any customer blast

## Error Handling

| Error Code | Meaning | Fix |
|---|---|---|
| 131030 | Message template not found | Check template name is approved |
| 131047 | Re-engagement window expired | Use template messages only (24h rule) |
| 100 | Invalid parameter | Check phone number format (no `+`) |
| 190 | Token expired | Regenerate permanent token at business.facebook.com |

## Status Check

```bash
# Check phone number registration status
curl "https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_NUMBER_ID}" \
  -H "Authorization: Bearer ${META_ACCESS_TOKEN}"
```

## Related Skills

- `studex-content-approvals` — get content approved before blasting
- `studex-morning-brief` — see daily status including pending WhatsApp sends
- `studex-ads-manager` — Meta Ads performance alongside WhatsApp campaigns
