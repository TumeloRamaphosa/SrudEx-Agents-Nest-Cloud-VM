# The Nexus Agents Nest

> **Home for StudEx Agent OS, CTO infrastructure (Claudio), and always-on agent coordination.**  
> Orchestrated by Robusca (Chief of Staff) · Agent Lord: Tumelo Ramaphosa  
> Git sync hub — agents and humans push state here for persistence and disaster recovery.

**Start here**

| Doc | Purpose |
|-----|---------|
| [`cto/HOME.md`](cto/HOME.md) | Claudio CTO vault — daily entry point |
| [`docs/INVENTORY.md`](docs/INVENTORY.md) | What is actually in this repo today |
| [`docs/OS-BRINGUP-CHECKLIST.md`](docs/OS-BRINGUP-CHECKLIST.md) | Honest bring-up status (Tailscale, OpenClaw, Git, Grok seats) |
| [`scripts/boot-nest.sh`](scripts/boot-nest.sh) | Boot Docker stack on a host |

---

## What is the Nest?

The **Agents Nest** is not a single app — it is the **repository + runtime layout** where:

1. **CTO layer (Claudio)** — technical authority, vault docs, OS bring-up (`cto/`)
2. **Agent OS** — multi-agent Python console (`studex-agent-os/`)
3. **Mission control** — War Room dashboard and APIs (`war-room/`)
4. **Sub-agents** — always-on Node workers (`agents/` + `docker/`)
5. **CoS brain** — Robusca workspace sync target (`robusca-brain/` — empty until synced)

Stud-Bot product go-live and Business Ghost Managed content live on a **separate track** (`robusca-brain` / related PRs). This repo holds **infrastructure and agent OS**, not product launch claims.

---

## How agents live here

```
┌──────────────────────────────────────────────────────────────┐
│  GitHub: The-Nexus-Agents-NEst                             │
├──────────────────────────────────────────────────────────────┤
│  cto/              Claudio — docs, skills, automations       │
│  agents/           shopify-agent, content-pipeline, …        │
│  war-room/         UI + /api/agents/register + /api/tasks    │
│  studex-agent-os/  Research, Markets, Ops, Comms, Deals      │
│  docker/           compose — binds the always-on layer       │
└──────────────────────────────────────────────────────────────┘
          ▲ git                              ▲ HTTP / webhooks
          │                                  │
    Mac (OpenClaw · Hermes · ClawX)    VM (docker compose)
```

**Register an agent** (War Room API — verify host/port on your deployment):

```bash
curl -X POST http://[HOST]:5000/api/agents/register \
     -H "Content-Type: application/json" \
     -d '{"name": "Hermes", "capabilities": ["messaging", "email"], "source": "mac-local"}'
```

**Post a task:**

```bash
curl -X POST http://[HOST]:5000/api/tasks \
     -H "Content-Type: application/json" \
     -d '{"agent": "shopify-agent", "task": "check-unfulfilled", "priority": "high"}'
```

OpenClaw / ClawX on Mac are **not wired by default** in this repo — see [`cto/Systems/mac-local-stack.md`](cto/Systems/mac-local-stack.md).

---

## Claudio (CTO) in the stack

| Layer | Where | Notes |
|-------|-------|-------|
| **Claudio vault** | [`cto/HOME.md`](cto/HOME.md) | HOME + Systems / Skills / Automations / Reports / Drive |
| **Hermes persona** | Obsidian roster, War Room, Agent OS README | Existing CTO runtime name — merge/alias TBD |
| **Human CTO line** | War Room UI | `t.rama.studexgroup.cto@agentmail.to` (AgentMail) |

Mirror substantive content from your **local Mac CTO vault** into `cto/` via PR. This bootstrap PR adds structure only.

---

## Boot the OS layer

### Quick path (VM or Linux host)

```bash
git clone https://github.com/TumeloRamaphosa/The-Nexus-Agents-NEst.git ~/nest
cd ~/nest
cp .env.example .env   # edit locally — never commit
chmod +x scripts/boot-nest.sh
./scripts/boot-nest.sh
```

Optional: install Nest CLI — `./studex-nest-cli/install.sh` then `nest-status`.

### Alternate: Agent OS only (dev)

```bash
cd studex-agent-os && ./install.sh && python3 app.py
# Warning: also uses port 5000 — do not run alongside War Room without changing port
```

Walk the full checklist: [`docs/OS-BRINGUP-CHECKLIST.md`](docs/OS-BRINGUP-CHECKLIST.md).

---

## Repository structure

```
The-Nexus-Agents-NEst/
├── cto/                        ← Claudio CTO vault (HOME, Systems, Skills, …)
├── docs/                       ← Inventory + OS bring-up checklist
├── scripts/                    ← boot-nest.sh
├── studex-agent-os/            ← Python Agent OS
├── war-room/                   ← Mission control (Express + React)
├── agents/                     ← Node sub-agents
├── docker/                     ← Docker Compose + Nginx
├── studex-nest-cli/            ← VM bash toolkit (nest-status, nest-pull, …)
├── studex-obsidian-vault/      ← StudEx Meat second brain (partial)
├── etb-cashclaw/               ← CashClaw agent economy
├── studex-auto-meat/           ← Shopify fulfillment
├── robusca-brain/              ← Robusca workspace (sync target — empty today)
├── memory/                     ← Daily session logs
└── .env.example                ← Secret template (no values)
```

Legacy name `SrudEx-Agents-Nest-Cloud-VM` still appears in some nested READMEs — migration in progress.

---

## VM details (historical — verify before use)

| Field | Value |
|:---|:---|
| **Name** | StudEx Meat — Auto Meat |
| **Provider** | Orgo.ai |
| **Specs** | 2 CPU / 8GB RAM / 30GB disk |
| **War Room** | port 5000 on host |

IPs and URLs in older docs may be stale. Confirm on the live host.

---

## Robusca replication model

```
PRIMARY (Perplexity Computer — cloud)
    ↓ orchestrates via Orgo API
VM INSTANCE (Auto Meat — this repo)
    ↓ commits results
GitHub (The-Nexus-Agents-NEst)
    ↑ pulls tasks
DARK FACTORY (D@RK F@C#0RY VM — Claude Code)
```

---

## Rules (CRITICAL)

1. **NEVER** post content without Agent Lord (Tumelo) approval
2. **NEVER** create Shopify products without approval
3. Customer names: **initials only** in all logs
4. All monetary values: **R prefix**
5. **NEVER** commit credentials — use `.env` locally only

---

## AgentMail addresses (documented — re-verify live)

| Address | Agent | Notes |
|---------|-------|-------|
| charlie@agent.studexmeat.com | Charlie orchestrator | In legacy README |
| naledi@agent.studexmeat.com | Naledi CMO | In legacy README |
| ceo@agent.studexmeat.com | Robusca | In legacy README |
| t.rama.studexgroup.cto@agentmail.to | CTO line | War Room UI |

---

Maintained by the Agents Nest · CTO vault: [`cto/HOME.md`](cto/HOME.md)
