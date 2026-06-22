# StudEx Agent OS v1.0

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

## Quick Start

```bash
# Install dependencies
./install.sh

# Run the Agent OS
python3 app.py

# Access dashboard
open http://localhost:5000
```

## Web Console

- **Dashboard**: `http://localhost:5000/`
- **Health Check**: `http://localhost:5000/health`
- **API Base**: `http://localhost:5000/api/`

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/status` | GET | System-wide status (agents, VM, market, pipeline) |
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
