# StudEx Agents Nest — Cloud VM

> The always-on agent infrastructure for StudEx Group.
> Orchestrated by Robusca (Chief of Staff) | Agent Lord: Tumelo Ramaphosa
> Backup & sync hub — all agents sync state here for persistence and disaster recovery.

---

## Repository Structure

```
SrudEx-Agents-Nest-Cloud-VM/
├── robusca-brain/              ← Robusca's main workspace (source of truth)
│   ├── team/                   ← Board of Directors + agent roster
│   ├── deployment/             ← Charlie OS deployment bundles + handoff prompts
│   ├── studex/                 ← Business docs, CTO playbook, Airtable base design
│   ├── studex-empire/          ← Agent empire (CashClaw, Goose, Hermes, OpenClaw)
│   ├── studex-dench-channel/   ← DenChClaw channel plugin
│   ├── os/war-room/            ← Full-stack React + Express + SQLite dashboard
│   ├── skills/                 ← 9 Robusca skills (Shopify, Content, Ads, etc.)
│   ├── protocols/              ← SOPs, morning routines
│   ├── scripts/                ← Backup scripts, github-backup.py
│   └── memory/                 ← Daily session logs + .dreams events
│
├── studex-obsidian-vault/      ← Obsidian second brain for Studex Meat
│   ├── 00-Core/                ← Brand bible, index
│   ├── 01-Business/            ← Strategy, goals, competitive landscape
│   ├── 02-Agents/              ← Full agent roster + Charlie OS spec
│   ├── 03-Products/            ← SKU catalog
│   ├── 04-Content/             ← Naledi's content engine + Youth Day plan
│   ├── 05-Campaigns/           ← Active + past campaign briefs
│   ├── 06-Finance/             ← P&L, margins, pricing strategy
│   ├── 07-Operations/          ← AgentMail setup, Shopify, TCG, Supabase
│   └── 08-Research/            ← Market intel, competitor analysis
│
├── etb-cashclaw/               ← CashClaw agent economy layer (v1.7.0)
│   ├── src/                    ← Engine, CLI, dashboard, guard
│   ├── skills/                 ← CashClaw skills (11 mission types)
│   └── missions/               ← Mission JSON definitions
│
├── studex-auto-meat/           ← Shopify webhook fulfillment automation
│   ├── agents/fulfiller/       ← Fulfiller agent
│   ├── src/routes/             ← Webhook handlers
│   ├── src/services/           ← Shopify, Supabase, WhatsApp clients
│   └── protocols/              ← Fulfilment SOP
│
├── studex-naledi-content/     ← Naledi influencer content engine
├── studex-app-warehouse/       ← Automated app builds (BMAD methodology)
├── studex-cto-playbook/       ← CTO technical playbook
│
├── agents/                     ← Charlie OS sub-agents
│   ├── approval-bot/           ← Webhook receiver for Discord/Slack approvals
│   ├── content-pipeline/       ← Polls approvals, dispatches to Higgsfield
│   └── shopify-agent/          ← Hourly: orders, inventory, fulfillment alerts
│
├── skills/                     ← OpenClaw skills (clawhub-ready)
├── docker/                     ← Docker Compose + Nginx config
├── memory/                     ← Daily session logs (workspace memory)
└── war-room/                   ← StudEx War Room (Express + React + Tailwind)
```

---

## VM Details

| Field | Value |
|:---|:---|
| **Name** | StudEx Meat — Auto Meat |
| **Provider** | Orgo.ai |
| **Workspace** | Studex Wildlife's workspace (a4977a1c) |
| **VM ID** | 946b3156-cab9-4187-a94b-056dfab35105 |
| **Specs** | 2 CPU / 8GB RAM / 30GB disk |
| **OS** | Ubuntu Linux |
| **Web UI** | http://67.213.119.157:22627 (Orgo VNC) |
| **War Room** | http://localhost:5000 (on VM) |

---

## Agent Connection Protocol

Other agents (Hermes, OpenClaw, D@RK F@C#0RY) connect to this VM as their coordination hub.

**Register an agent**
```bash
curl -X POST http://[VM-IP]:5000/api/agents/register \
     -H "Content-Type: application/json" \
     -d '{"name": "Hermes", "capabilities": ["messaging", "email", "notifications"], "source": "orgo-vm"}'
```

**Post a task to the queue**
```bash
curl -X POST http://[VM-IP]:5000/api/tasks \
     -H "Content-Type: application/json" \
     -d '{"agent": "shopify-agent", "task": "check-unfulfilled", "priority": "high"}'
```

---

## Robusca Replication Model

```
PRIMARY (Perplexity Computer — cloud)
    ↓ orchestrates via Orgo API
VM INSTANCE (Auto Meat — this repo)
    ↓ commits results
robusca-brain (GitHub — source of truth)
    ↑ pulls tasks
DARK FACTORY (D@RK F@C#0RY VM — Claude Code)
```

All three instances sync via `robusca-brain`. PRIMARY delegates, VM executes, Dark Factory builds.

---

## Quick Start (on the VM)

```bash
# Clone this repo
git clone https://github.com/TumeloRamaphosa/SrudEx-Agents-Nest-Cloud-VM.git ~/nest
cd ~/nest

# Copy .env and fill in secrets
cp .env.example .env
nano .env

# Start the full stack
docker compose -f docker/docker-compose.yml up -d

# Or use the startup script (no Docker)
bash ~/robusca/scripts/start.sh
```

---

## Rules (CRITICAL)

1. **NEVER** post content without Agent Lord (Tumelo) approval
2. **NEVER** create Shopify products without approval
3. Customer names: **initials only** in all logs
4. All monetary values: **R prefix**
5. Check inventory before posting product-featured content

---

## Active Campaigns

- **Youth Day 2026** (June 16) — "The Youth Shall Inherit the Flame"
- **Father's Day** (June 15) — Flash auction + Tomahawk bundle
- **Global Markets Expansion** — Russia partnership + international shipping

---

## AgentMail Addresses

| Address | Agent | Status |
|---------|-------|--------|
| charlie@agent.studexmeat.com | Charlie orchestrator | ✅ Active |
| naledi@agent.studexmeat.com | Naledi CMO | ✅ Active |
| ceo@agent.studexmeat.com | Robusca | ✅ Active |

---

Maintained by Robusca — Chief of Staff, StudEx Group
Perplexity Computer instance | t.ramaphosa@studex.dev
