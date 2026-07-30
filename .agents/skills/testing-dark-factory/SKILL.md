---
name: testing-dark-factory
description: Test the Dark Factory client portal end-to-end. Use when verifying Dark Factory UI, API, or form submission changes.
---

# Testing Dark Factory Phase 1

## Prerequisites

- War Room dev server running on port 5000
- Start with: `cd /home/ubuntu/repos/SrudEx-Agents-Nest-Cloud-VM/war-room && npx tsx server/index.ts`
- Database starts clean (SQLite, no projects initially)
- No VPN or external secrets needed for local testing

## Devin Secrets Needed

None — all testing runs against localhost.

## How to Run the Server

```bash
cd /home/ubuntu/repos/SrudEx-Agents-Nest-Cloud-VM/war-room
npx tsx server/index.ts
```

Server runs on http://localhost:5000. The Dark Factory tab is the last tab in the tab bar — you may need to scroll the tab bar right to find it.

## Test Scenarios

### 1. Service Catalog

Navigate to Dark Factory tab. Verify 5 service tier cards:
- Quick Fix: From $150, 24-48 hours
- Micro Build: From $500, 3-5 days
- Mini Project: From $1,500, 1-2 weeks
- MVP Build: From $5,000, 2-4 weeks
- Custom Project: Custom Quote, Custom timeline

### 2. Card Expansion

Click a service card. Verify:
- Gold border appears on selected card
- Feature bullet list expands below the card description
- Other cards do NOT show features

### 3. Form Validation

Without filling fields, verify submit button ("SUBMIT PROJECT REQUEST") is disabled (has `disabled` attribute). Fill only partial fields and confirm it stays disabled until all required fields are filled (name, email, service tier, title).

### 4. Full Form Submission

Fill all required fields + optional description/links. Click submit. Verify:
- View switches to Projects automatically
- Projects counter increments (e.g. "Projects (1)")
- Project card shows correct: title, client name/email, price, tier badge
- 7-step StatusPipeline visible (Intake → Scoping → Approved → Sandbox → Building → Review → Delivered)
- 3 PaymentStages visible (10% deposit, 40% build, 50% final)
- Review counter (0/3)

### 5. Empty State

Before creating any projects, click "Projects (0)". Verify empty state message and "Submit Request" button.

### 6. API Status Update

After creating a project via Test 4, use curl to update status:
```bash
# Get project ID
curl -s http://localhost:5000/api/factory/projects | python3 -m json.tool

# Update status to "scope"
curl -s -X PATCH http://localhost:5000/api/factory/projects/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "scope"}'
```

Navigate back to Dark Factory Projects view and verify:
- "Intake" step shows green (completed)
- "Scoping" step shows gold (active)

Note: After a full page refresh, the app defaults to the Queue tab. You need to scroll the tab bar right and click "Dark Factory" again, then click "Projects (1)".

### 7. How It Works Section

Scroll to bottom of the Dark Factory page. Verify 4-step section:
- 01 Submit
- 02 Plan & Deposit
- 03 Build & Review
- 04 Ship & Deliver

Each step should have a description paragraph.

## Testing the standalone Next.js portal (apps/site) + PayFast

The live customer site (factory.studex-group.com) is the Next.js app now at
`apps/site/` in this repo (previously the un-versioned `dark-factory/` folder).
It is separate from the war-room dashboard above and is what handles real
PayFast/QuickBooks/AgentMail. Test it like this:

### 1. Pull real env + run the production build from apps/site
```bash
cd /home/ubuntu/repos/SrudEx-Agents-Nest-Cloud-VM/apps/site
# Vercel CLI needs auth; use the org VERCEL_TOKEN secret (do NOT run interactive login)
export VERCEL_TOKEN=<VERCEL_TOKEN>
cp -r /home/ubuntu/repos/dark-factory/.vercel .vercel   # reuse existing project link if present
vercel env pull .env.local --environment=production --token "$VERCEL_TOKEN" --yes
npm run build && (npm run start -- -p 3000 &)
```

### 2. Force sandbox PayFast for local testing
The pulled prod env may have **empty** `PAYFAST_ENV/PASSPHRASE/SITE_URL/USD_TO_ZAR`.
The sandbox merchant (10000100 / 46f0cd694581a) needs passphrase `jt7NOE43FZPn`.
Append to `.env.local` before starting the server:
```
PAYFAST_ENV="sandbox"
PAYFAST_PASSPHRASE="jt7NOE43FZPn"
PAYFAST_SITE_URL="http://localhost:3000"
USD_TO_ZAR="18.5"
```
Delete `.env.local` after testing (it contains real secrets — never commit it).

### 3. Exercise the pay flow
- Create a project: `POST /api/factory/intake` requires `clientName, clientEmail, serviceId, title` (NOT `name`; `description` optional). Response has the project `id` at top level (e.g. `DF-XXXX`), not nested under `project`.
- Checkout: `POST /api/payfast/checkout {projectId, stage}` where stage ∈ `deposit|build|final`. Returns `{url, amountZar, amountUsd, stage}`; `url` should point to `sandbox.payfast.co.za/eng/process?...&signature=<hex>`.
- In the browser: New Request tab → Projects tab → click "Pay with PayFast" on a stage. **PASS** = redirect to the PayFast sandbox payment page showing the ZAR amount (e.g. R277.50 = $15×18.5), NOT a "signature does not match"/400 error.

### Notes / gotchas
- The ITN webhook (mark-paid → QuickBooks → email) fires from PayFast's servers to `notify_url`, which **cannot reach localhost** — so completing a sandbox payment won't mark the stage paid locally. Verify the ITN loop against the live deploy or skip it when the code is unchanged.
- Amounts on stages are 10/40/50 of the USD tier price, converted to ZAR (× USD_TO_ZAR). For $150 Quick Fix: deposit $15→R277.50, build $60, final $75.

## Tips

- The tab bar has many tabs (15+). Dark Factory is the last one. You may need to scroll horizontally or click the scrollbar to reveal it.
- After a full page refresh, the app navigates to the default Queue tab. Re-navigate to Dark Factory by scrolling right in the tab bar.
- The form resets all fields after successful submission, so you can re-test without restarting the server.
- API endpoints: GET `/api/factory/services`, GET `/api/factory/projects`, POST `/api/factory/intake`, PATCH `/api/factory/projects/:id/status`, PATCH `/api/factory/projects/:id/payment`
- Valid status values: intake, scope, approved, sandbox-created, building, review-ready, delivered
- Valid payment stages: deposit, build, final
