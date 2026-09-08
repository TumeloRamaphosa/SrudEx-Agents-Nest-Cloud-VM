# 🐳 OpenClaw Docker Deployment

> Running me (Robusca) in Docker, in the cloud, accessible to the whole team

---

## How It Works

OpenClaw can run inside a **Docker container** on any cloud VM. This means:
- I'm not tied to your MacBook
- I run 24/7 in the cloud
- Multiple agents can access me
- I can orchestrate the entire fleet from one place

## Architecture

```
Cloud VM (Orgo / Alibaba / AWS)
└── Docker Container
    └── OpenClaw (Robusca)
        ├── Memory (persistent)
        ├── Tools (Orgo API, Gitea, Discord, etc.)
        ├── Agent Fleet (300 CashClaw agents)
        └── Execution Exchange
```

## Deployment Steps

### 1. Provision a Cloud VM
- **Orgo:** 4 CPU / 16GB (or upgrade existing "Global Markets" VM)
- **Alibaba Cloud:** ECS with Docker support
- **OS:** Ubuntu 24.04 LTS

### 2. Install Docker
```bash
curl -fsSL https://get.docker.com | sh
```

### 3. Run OpenClaw in Docker
```bash
docker run -d \
  --name robusca \
  -v /data/robusca-memory:/memory \
  -e OPENCLAW_API_KEY=... \
  -e DISCORD_TOKEN=... \
  -e ORGO_API_KEY=... \
  openclaw/openclaw:latest
```

### 4. Connect the App
The GitHub Pages app (`tumeloramaphosa.github.io/studex-mobile`) connects to the cloud OpenClaw via API.

---

## Gitea as Central Hub

Instead of GitHub, we use **Gitea** (already running at `localhost:3000`).

### Access for Agents
Each agent gets:
- **Gitea account** — read/write access to repos
- **API token** — programmatic access
- **SSH key** — git operations

### Repos to Share
| Repo | Access | Purpose |
|------|--------|---------|
| `robusca-memory` | All agents | Shared memory, strategy docs |
| `studex-mobile` | Dev agents | App source code |
| `rwanda-vault` | All agents | Rwanda project docs |
| `agent-scripts` | All agents | Deployment scripts |

### Link for Agents
```
Gitea: http://<cloud-ip>:3000
Repos: http://<cloud-ip>:3000/tumelo/robusca-memory
```

---

## Team Access

### President Robusca (Discord Bot)
- Commands the fleet via Discord
- Reads from Gitea for strategy
- Posts updates to channels

### HyperAgent
- Orchestrates agent workflows
- Connects to OpenClaw API
- Manages CashClaw agent deployment

### Dark Factory (CTO)
- SSH access to cloud VMs
- Docker management
- Infrastructure deployment

### Super Agents (CTO)
- Gitea access for project docs
- Orgo API for VM management
- Customer pipeline access

### Customer Sales Relations
- Gitea access for deal pipeline
- Execution Exchange access
- Partner documentation
