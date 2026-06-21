# StudEx War Room — Mission Control Spec
**Version:** 1.0 | **Status:** Ready to Build | **Last Updated:** 2026-06-21

---

## Concept

A unified, dark-themed **NASA Mission Control** dashboard for the entire StudEx Meat empire. One screen. Every metric. Every agent. Every rand.

Built on the existing `war-room/` stack: Express + React + SQLite + Drizzle + Tailwind + Recharts.

Inspired by: Hermes AgentOS Mission Control Dashboard (asadtinkers.com)

---

## Design Language

| Token | Value |
|-------|-------|
| Background | `#0A0A0F` (near-black) |
| Surface | `#111827` (dark slate) |
| Card | `#1F2937` (charcoal) |
| Primary Accent | `#D4AF37` (StudEx Gold) |
| Secondary Accent | `#1F1F1F` (rich black) |
| Text Primary | `#F9FAFB` |
| Text Secondary | `#9CA3AF` |
| Success | `#10B981` |
| Warning | `#F59E0B` |
| Danger | `#EF4444` |
| Chart Colors | `#D4AF37`, `#10B981`, `#3B82F6`, `#8B5CF6` |

**Typography:** Inter (sans), JetBrains Mono (numbers/metrics)
**Icon set:** Lucide React (consistent stroke icons)
**Animation:** Framer Motion — subtle pulse on live data, smooth tab transitions

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│              STUDENT MISSION CONTROL             │
│                 (StudEx War Room)               │
├─────────────────────────────────────────────────┤
│  Sidebar Nav │        Main Content Area         │
│              │                                   │
│  Overview    │  ┌──────────┐ ┌──────────┐       │
│  Marketing   │  │ KPI Card │ │ KPI Card │       │
│  Commerce    │  └──────────┘ └──────────┘       │
│  Content     │  ┌─────────────────────────┐     │
│  Finance     │  │    Revenue Chart        │     │
│  Ops         │  └─────────────────────────┘     │
│              │  ┌──────────┐ ┌──────────┐       │
│  ─────────   │  │ Chart    │ │ Activity │       │
│  Naledi CEO  │  └──────────┘ └──────────┘       │
│              │                                   │
└─────────────────────────────────────────────────┘
```

---

## Data Sources & Connectors

| Source | Method | Credentials Location |
|--------|--------|----------------------|
| Facebook Ads | Meta Graph API | `studex-meta-whatsapp` skill |
| Instagram | Meta Graph API | Same as Facebook |
| Google Ads | Google Ads API | `studex-ads-manager` skill |
| Shopify | REST Admin API | `.env` |
| Supabase | `@supabase/supabase-js` | `.env` |
| AgentMail | AgentMail API (`/v0/`) | `TOOLS.md` |
| WhatsApp | Meta Cloud API | `studex-meta-whatsapp` skill |
| Studex Auto-Meat | Webhook DB | Local SQLite |
| CashClaw | JSON files | `etb-cashclaw/` |

---

## Database Schema

### Tables

**`marketing_metrics`** — daily rollup
```sql
date, platform, impressions, reach, clicks, spend, conversions, conversion_value, ctr, roas
```

**`commerce_metrics`** — daily rollup
```sql
date, orders, revenue, aov, top_product, new_customers, returning_customers
```

**`content_posts`** — post tracker
```sql
id, platform, content_type, caption, media_url, status, scheduled_at, published_at, impressions, likes, comments, shares, link, approved_by, created_at
```

**`content_campaigns`** — campaign tracker
```sql
id, name, platform, start_date, end_date, budget, status, notes
```

**`finance_transactions`** — P&L line items
```sql
id, date, category, description, amount, type (income/expense), source
```

**`agent_activity`** — who did what
```sql
id, agent_name, action, details, timestamp
```

**`tasks`** — Kanban board
```sql
id, title, description, status (todo/in-progress/done), priority, assignee, due_date, created_at
```

**`email_metrics`** — AgentMail stats
```sql
date, inbox_name, emails_received, emails_sent, threads
```

---

## Pages & Features

### 1. OVERVIEW — Live Ops Console
- **4 KPI Cards:** Today's Revenue, Active Orders, Ad Spend (today), Content Engagements
- **Revenue Sparkline:** last 7 days
- **Order Feed:** live stream of new Shopify orders (auto-refresh 30s)
- **Agent Radar:** which agents are active right now
- **Alert Banner:** orders needing fulfillment, ad campaigns low on budget, DNS status
- **Quick Actions:** Approve content, view order, send WhatsApp

### 2. MARKETING — Meta + Google Ads
- **Platform Tabs:** Facebook | Instagram | Google Ads
- **Date Range Selector:** Today / 7 days / 30 days / Custom
- **Metrics Grid:** Spend | Impressions | Reach | CTR | CPC | ROAS | Conversions
- **Line Chart:** Spend vs Revenue (dual axis) over time
- **Donut Chart:** Budget split by campaign
- **Campaign Table:** name, status, spend, results, ROAS — sortable
- **Ad Set Performance:** breakdown by audience/creative
- **Export:** CSV download

### 3. COMMERCE — Shopify + Orders
- **Today's Stats:** Orders | Revenue | AOV | Top SKU
- **Recent Orders Table:** order #, customer, items, total, fulfillment status, channel
- **Fulfillment Status:** Pending / Processing / Shipped / Delivered counts
- **Top Products:** best sellers today / this week
- **Inventory Alerts:** low stock items
- **Customer Retention:** new vs returning chart

### 4. CONTENT — Naledi's Newsroom
- **Content Calendar:** weekly grid view, drag-free (cron updates status)
- **Post Queue:** pending approval | scheduled | published | failed
- **Platform Tabs:** TikTok (Freekpik) | Instagram (Higgsfikd) | Facebook | Twitter
- **Approval Panel:** click post → preview → approve / reject / edit
- **Youth Day Tab:** active campaign posts + performance
- **Caption Library:** reusable caption templates
- **Media Asset Links:** Freepik + Higgsfield generated content
- **Engagement Metrics:** impressions, likes, shares, comments per post

### 5. FINANCE — P&L Dashboard
- **Date Range:** This month / Last month / Quarter / Year
- **Revenue Card:** total income
- **Cost Card:** total costs
- **Net Profit Card:** color-coded green/red
- **P&L Table:** line items by category
  - Income: Shopify sales, wholesale, corporate gifting
  - Expenses: COGS, Meta ads, Google ads, packaging, delivery, subscriptions
- **Donut Chart:** expense breakdown
- **Revenue by Channel:** Shopify vs Wholesale vs Other
- **CashClaw Integration:** agent economy costs tracked

### 6. OPERATIONS — Ops Nerve Center
- **WhatsApp Panel:** messages sent/received, template usage, open rate
- **AgentMail Panel:** emails received per inbox (charlie, naledi, ceo), unread count
- **Shopify Health:** store status, webhook connectivity
- **DNS Status:** AgentMail domain verification status
- **Agent Activity Log:** recent actions by each agent
- **Cron Jobs:** scheduled tasks, last run, next run
- **System Health:** VM CPU/RAM/disk (from `/proc/stat`)

### 7. NALEDI CEO VIEW — Content as a Business
- **Content P&L:** cost to produce content vs revenue attributed
- **Platform Scorecards:** TikTok | IG | FB — followers, engagement rate, reach
- **Naledi's KPIs:**
  - Posts published this week
  - Approval turnaround time
  - Engagement vs previous week
  - Youth Day campaign ROI
- **Top Performing Posts:** this week leaderboard
- **Content Pipeline:** ideas → draft → approval → scheduled → published → measured
- **AI Asset Links:** Freepik images used, Higgsfield videos created

---

## Naledi CEO Mode — Content Business Spec

Naledi runs content like a media company. The War Room gives her:

1. **Editorial Calendar** — what posts when, on which platform
2. **Approval Queue** — Tumelo approves or rejects with one click
3. **Performance Scorecards** — which post type wins on which platform
4. **Asset Library** — Freepik images + Higgsfield videos organized by campaign
5. **Caption Vault** — reusable templates that perform
6. **Youth Day Performance** — dedicated campaign dashboard

**Naledi's daily workflow:**
- Morning: check War Room → see scheduled posts → any urgent items
- Create: draft caption + brief → submit for Tumelo approval
- Schedule: approved posts → auto-scheduled via cron
- Measure: end of day → review engagement metrics

---

## Freepik + Higgsfield Integration

### Freepik (Image Generation)
- API: `api.freepik.com` (Premium subscription)
- Use: Campaign visuals, product hero shots, brand graphics
- Flow: Naledi requests image → generated → saved to Supabase storage → linked in post
- Sku/Brand: StudEx Black & Gold theme tokens pre-configured

### Higgsfield.ai (Video Generation)
- API: `api.higgsfield.ai`
- Use: TikTok/Reels video generation, product demos, campaign clips
- Flow: Script → generate 6s video → download → post to IG/TikTok
- Voiceover: batch_text_to_music for music beds, synthesize_speech for narration

---

## Technical Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TypeScript |
| UI Components | Radix UI (accessible) |
| Styling | Tailwind CSS + CSS custom properties |
| Charts | Recharts |
| Animations | Framer Motion |
| Backend | Express 5 + better-sqlite3 |
| ORM | Drizzle ORM |
| Data Fetching | TanStack Query (React Query) |
| Icons | Lucide React |
| Deployment | Docker on Orgo VM |
| CI/CD | GitHub Actions (push to VM) |

---

## Deployment to Orgo VM

```bash
# On VM (67.213.119.157)
git clone https://github.com/TumeloRamaphosa/SrudEx-Agents-Nest-Cloud-VM.git /opt/studex
cd /opt/studex/war-room
docker compose up -d

# Or without Docker:
npm install
npm run build
npm start  # runs on port 5000
```

**Access:** `http://67.213.119.157:5000` (local to VM)
**Remote access:** SSH tunnel or Tailscale VPN

---

## Build Priority

### Phase 1 — Foundation (Now)
- [ ] War Room frontend: all 7 tabs scaffolded with dark theme
- [ ] Backend: Express routes for all data sources
- [ ] Database: Drizzle schema + SQLite
- [ ] Overview page: KPIs, revenue chart, order feed

### Phase 2 — Marketing (This week)
- [ ] Meta Graph API connector
- [ ] Google Ads API connector
- [ ] Marketing tab: campaign table + charts
- [ ] Date range selector

### Phase 3 — Commerce + Content (This week)
- [ ] Shopify Admin API connector
- [ ] Commerce tab: orders + inventory
- [ ] Content calendar grid
- [ ] Approval panel

### Phase 4 — Finance + Ops (Next week)
- [ ] P&L table + charts
- [ ] AgentMail API connector
- [ ] WhatsApp metrics panel
- [ ] System health metrics

### Phase 5 — Naledi CEO Mode (Next week)
- [ ] Content P&L calculator
- [ ] Freepik connector
- [ ] Higgsfield connector
- [ ] Naledi scorecard tab

---

## War Room Routes

```
GET  /api/overview          — all KPIs + today's stats
GET  /api/marketing         — Meta + Google ads data
GET  /api/marketing/meta    — Facebook + IG insights
GET  /api/marketing/google  — Google Ads data
GET  /api/commerce/orders   — Shopify orders
GET  /api/commerce/products — Shopify products + inventory
GET  /api/content/posts     — all posts + engagement
GET  /api/content/campaigns — campaign list
POST /api/content/approve    — approve a post (Naledi gate)
POST /api/content/reject    — reject a post
GET  /api/finance           — P&L data
GET  /api/finance/pnl      — income vs expense breakdown
GET  /api/ops/whatsapp      — WhatsApp message stats
GET  /api/ops/email         — AgentMail inbox stats
GET  /api/ops/health        — VM system metrics
GET  /api/agent-activity    — recent agent actions
POST /api/tasks             — create/update task
GET  /api/tasks             — all tasks (Kanban)
```
