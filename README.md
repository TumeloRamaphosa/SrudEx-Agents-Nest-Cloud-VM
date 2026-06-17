# StudEx Agents Nest — Cloud VM

> The always-on agent infrastructure for StudEx Group.
> Orchestrated by **Robusca** (Chief of Staff) | Agent Lord: Tumelo Ramaphosa
> **ADAM SMASHER** runs StudEx Global Markets from this VM.

---

## What Lives Here

```
SrudEx-Agents-Nest-Cloud-VM/
├── war-room/              ← Express + React + SQLite UI (port 5000)
├── agents/
│   ├── shopify-agent/         ← Hourly: orders, inventory, fulfilment
│   ├── content-pipeline/      ← Polls approvals → Higgsfield
│   ├── approval-bot/          ← Webhook receiver (port 3002)
│   └── discord-bot/           ← ADAM SMASHER command center (14 commands)
├── skills/                ← 7 Robusca skills (SKILL.md format)
├── docker/                ← Docker Compose + Nginx
└── README.md
```

## ADAM SMASHER — Global Markets Commands

In Discord, type `@ADAM [command]`:

| Command | Description |
|---------|-------------|
| `@ADAM help` | Full command reference |
| `@ADAM status` | System health check |
| `@ADAM markets` | Live USD/ZAR, RUB/ZAR, BRENT, GOLD, PLAT |
| `@ADAM research [topic]` | Agent-Reach intelligence (13 platforms) |
| `@ADAM deal [name]` | Log deal to pipeline CRM |
| `@ADAM pipeline` | Show all 20 Africa deals |
| `@ADAM trade [idea]` | Log trade idea |
| `@ADAM meeting [title]` | Schedule boardroom meeting |
| `@ADAM agents` | Boardroom agent status |
| `@ADAM vm [client]` | Client VM: pharma / art / ntech |
| `@ADAM approve [id]` | Submit approval to War Room |
| `@ADAM sync` | Sync state to GitHub |
| `@ADAM me` | Your profile |
| `@ADAM events` | Upcoming events |

## VM Details

| Field | Value |
|-------|-------|
| Name | StudEx Meat — Auto Meat |
| Provider | Orgo.ai |
| Workspace | a4977a1c |
| VM ID | 946b3156-cab9-4187-a94b-056dfab35105 |
| Specs | 2 CPU / 8GB RAM / 30GB |
| OS | Ubuntu Linux |
| War Room | http://localhost:5000 |
| Discord | ADAM SMASHER bot |

## Quick Start (On the VM)

```bash
# Pull latest
cd ~/nest && git pull

# Add Discord credentials to .env
nano .env
# Add: DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID, ALLOWED_USER_IDS

# Start everything
docker compose -f docker/docker-compose.yml up -d

# Or without Docker:
bash ~/robusca/scripts/start.sh
```

## Revenue Model — StudEx Global Markets

| Client | Quarterly | Annual |
|--------|-----------|--------|
| PharmaSyntez | $11K-$26K | $45K-$105K |
| Art Engineer | $36K-$76K | $145K-$305K |
| NTECHLAB | $61K-$151K | $245K-$605K |
| **Total** | **$109K-$254K** | **~$1M** |

## Deal Pipeline

- NTechLab × Kenya NHIS pilot: $50K facilitation
- Art Engineer × Airtel Africa DC: $200K-$2M
- NTechLab × Art Engineer BUNDLE: $500K-$5M
- PharmaSyntez × Evohealth SA: $15K facilitation
- **Total Pipeline: R85M+ across 20 deals**

---

_Agent Lord: Tumelo Ramaphosa | github.com/TumeloRamaphosa_
