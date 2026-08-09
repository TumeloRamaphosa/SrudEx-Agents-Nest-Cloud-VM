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
pip3 install -r requirements.txt   # or ./install.sh

# Wire up Grok (xAI) so the console can chat and dispatch work
export XAI_API_KEY=xai-...          # key from https://console.x.ai
export GROK_MODEL=grok-4.5          # optional, this is the default

# Run the Agent OS
python3 app.py

# Access dashboard
open http://localhost:5000
```

Without `XAI_API_KEY` everything else still works; the chat panel simply reports
`XAI_API_KEY not set` and stays disabled.

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
| `/api/chat` | POST | Grok-powered ADAM SMASHER chat, streamed as SSE |
| `/api/chat/config` | GET | Whether Grok is configured, and which model |

## Grok agent interface

`Ask ADAM SMASHER` on the dashboard talks to Grok through the xAI Responses API
(`/v1/responses`) with function calling, so answers are grounded in live VM state
rather than guessed:

| Tool | What Grok can do |
|------|------------------|
| `get_status` | Agent fleet, CPU/RAM/disk, pipeline totals, market levels |
| `get_pipeline` | Every deal with value, stage and win probability |
| `get_agent_history` | Recent tasks handled by one agent |
| `read_agent_memory` | Read an agent's persistent memory file |
| `assign_task` | Dispatch a task to Research/Markets/Ops/Comms/Deals |

xAI's server-side `web_search` tool is attached too, so questions about FX or
commodity news are answered from the live web with citations. Searches and
function calls both stream to the UI as a trace, so you can see exactly what the
model read before it answered.

**Guardrail:** Grok can draft anything but sends nothing. `assign_task` only
queues work; outbound email/social still goes through the existing approval bot.

| Env var | Default | Purpose |
|---------|---------|---------|
| `XAI_API_KEY` | — | xAI API key (`GROK_API_KEY` also accepted) |
| `GROK_MODEL` | `grok-4.5` | Model id |
| `GROK_BASE_URL` | `https://api.x.ai/v1` | Override for a proxy/gateway |
| `STUDEX_BASE_PATH` | this directory | Where `memory/` lives on the VM |

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
