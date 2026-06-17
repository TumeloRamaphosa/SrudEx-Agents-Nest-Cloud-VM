# StudEx Agents Nest — Cloud VM

> The always-on agent infrastructure for StudEx Group.
> Orchestrated by **Robusca** (Chief of Staff) | Agent Lord: Tumelo Ramaphosa

---

## What Lives Here

This repo is the source of truth for everything running on the **StudEx Meat — Auto Meat VM** (Orgo.ai, 2CPU/8GB).

```
SrudEx-Agents-Nest-Cloud-VM/
├── war-room/          ← StudEx War Room (Express + React + Tailwind + SQLite)
├── agents/
│   ├── shopify-agent/     ← Hourly: orders, inventory, fulfilment alerts
│   ├── content-pipeline/  ← Polls approvals queue, dispatches to Higgsfield
│   └── approval-bot/      ← Webhook receiver for Discord/Slack approvals
├── skills/            ← All 7 Robusca skills (SKILL.md format)
├── docker/            ← Docker Compose stack + Nginx config
├── memory/            ← Session logs (symlinked to robusca-brain)
├── .env.example       ← Credential template
└── README.md          ← This file
```

---

## VM Details

| Field | Value |
|---|---|
| Name | StudEx Meat — Auto Meat |
| Provider | Orgo.ai |
| Workspace | Studex Wildlife's workspace (a4977a1c) |
| VM ID | 946b3156-cab9-4187-a94b-056dfab35105 |
| Specs | 2 CPU / 8GB RAM / 30GB disk |
| OS | Ubuntu Linux |
| Web UI | http://67.213.119.157:22627 (Orgo VNC) |
| War Room | http://localhost:5000 (on VM) |

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

## Agent Connection Protocol

Other agents (Hermes, OpenClaw, D@RK F@C#0RY) connect to this VM as their coordination hub.

### Register an agent

```bash
curl -X POST http://[VM-IP]:5000/api/agents/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hermes",
    "capabilities": ["messaging", "email", "notifications"],
    "source": "orgo-vm",
    "vm_id": "[hermes-vm-id]"
  }'
```

### Post a task to the queue

```bash
curl -X POST http://[VM-IP]:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "agent": "shopify-agent",
    "task": "check-unfulfilled",
    "priority": "high"
  }'
```

### Subscribe to agent events (Discord webhook)
Set `DISCORD_WEBHOOK_URL` in `.env` — the approval-bot posts status updates automatically.

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

## Skills

All 7 Robusca skills are in `skills/`. Load them in any agent session:

| Skill | Trigger |
|---|---|
| `studex-shopify-fulfil` | "fulfil order #XXXX" |
| `studex-content-approvals` | "approve content" |
| `studex-meta-whatsapp` | "send WhatsApp blast" |
| `studex-morning-brief` | "morning report" |
| `studex-ads-manager` | "ads report" |
| `studex-inventory-audit` | "inventory audit" |
| `robusca-memory-sync` | "sync memory" |

---

## Rules (CRITICAL)

1. **NEVER post content without Agent Lord (Tumelo) approval**
2. **NEVER create Shopify products without approval**
3. Customer names: initials only in all logs
4. All monetary values: R prefix
5. Check inventory before posting product-featured content

---

## Maintained by

**Robusca** — Chief of Staff, StudEx Group  
Perplexity Computer instance | t.ramaphosa@studex.dev
