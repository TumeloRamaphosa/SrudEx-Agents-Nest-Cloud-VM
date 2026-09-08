# StudEx Agent OS v1.1

**Agent-Native Operating System for Global Markets Intelligence**

## Overview

StudEx Agent OS is a unified multi-agent platform built on the Orgo.ai Ubuntu VM where ADAM SMASHER (AI CEO) coordinates specialized sub-agents for Research, Markets, Operations, Communications, and Deals.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ADAM SMASHER (AI CEO)                         │
│              Multi-Agent Orchestration Layer                    │
├─────────┬─────────┬─────────┬─────────┬─────────┬─────────────┤
│Research │ Markets │   Ops   │ Comms   │  Deals  │  Memory OS  │
│ Agent   │ Agent   │ Agent   │ Agent   │ Agent   │ Knowledge   │
└─────────┴─────────┴─────────┴─────────┴─────────┴─────────────┘
```

## Inspired By

- **Agno AgentOS**: Marc Bara's architecture for agent-native operating systems
- **Claude Code Persistent Agents**: Long-running AI agents with memory
- **Cult UI Workflow Patterns**: ReAct, plan-solve agentic patterns

## Agent Capabilities

| Agent | Role | Memory Store |
|-------|------|--------------|
| Research | Web searches, content extraction, market intelligence | `memory/research.md` |
| Markets | USDZAR, BRENT, GOLD, SA grain tracking | `memory/market-data.json` |
| Ops | VM health, PM2/Docker monitoring, nest-cli | `memory/uptime.json` |
| Comms | Email, Discord, Lark message drafting | `memory/templates/` |
| Deals | Pipeline tracking, Uvelka updates, MEATSA CRM | `memory/pipeline.json` |

## Tech Stack

- **Runtime**: Python 3, Flask (Port 5000)
- **VM**: Orgo.ai Ubuntu 22.04
- **Agent Framework**: Agno-style architecture
- **Memory OS**: File-based with JSON/Markdown
- **Dashboard**: HTML/JS with live API polling

## Mac command room (v1.1)

ADAM SMASHER now folds the Mac command room into the OS roster:

| Engine | Bind / URL |
|---|---|
| OpenMausBot | `127.0.0.1:18799` · https://maus.studex-group.com |
| Ollama | `127.0.0.1:11434` |
| Hermes ACP | `hermes-acp` · https://hermes.studex-group.com |
| Claude / Cursor / OpenCode / Antigravity | local CLIs |

`GET /api/command-room` returns live probes. On macOS the dashboard binds **127.0.0.1:5060** (AirPlay owns 5000; 5050 is often taken).

## Quick Start

```bash
# Install dependencies
./install.sh

# Mac (loopback :5060)
./start.sh
open http://127.0.0.1:5060

# VM (loopback :5000)
STUDEX_OS_PORT=5000 python3 app.py
```

## Web Console

- **Dashboard (Mac)**: `http://127.0.0.1:5060/`
- **Dashboard (VM)**: `http://127.0.0.1:5000/`
- **Health Check**: `/health`
- **API Base**: `/api/`
- **Command room**: `/api/command-room`
- **Register agent**: `POST /api/agents/register`

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/status` | GET | System-wide status (agents, VM, market, pipeline, command room) |
| `/api/command-room` | GET | Live OpenMausBot / Hermes / Ollama / CLI probes |
| `/api/agents/register` | POST | Register an external engine with the OS |
| `/api/agent/<name>/task` | POST | Submit task to named agent |
| `/api/agent/<name>/history` | GET | Get agent task history |
| `/api/pipeline` | GET | Deal pipeline data |

## For Tumelo Ramaphosa

This platform demonstrates:
1. Linux systems development
2. Multi-agent coordination
3. Memory-based AI architectures
4. Web dashboard with real-time data

**Deployed**: Hermes MC https://cpgnv2r4lvm8.space.minimax.io
**Repository**: github.com/TumeloRamaphosa/SrudEx-Agents-Nest-Cloud-VM

---

*ADAM SMASHER coordinates. The agents execute. StudEx learns.*
