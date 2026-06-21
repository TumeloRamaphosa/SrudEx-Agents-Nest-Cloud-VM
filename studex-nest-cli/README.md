# StudEx Nest CLI — VM Management Toolkit

**Midnight Project #1 — Built for Tumelo Ramaphosa (ADAM SMASHER AI CEO)**

## Overview

The StudEx Nest CLI is a Linux bash script toolkit for managing the Orgo.ai VM. It provides quick commands for Git pulls, service status, logs, market data, and more.

## Quick Start

```bash
# Install the toolkit
./install.sh

# View all commands
nest-help

# Check VM health
nest-status

# Pull latest updates
nest-pull

# View logs
nest-logs
```

## Commands

| Command | Description |
|---------|-------------|
| `nest` | Main launcher (runs subcommands) |
| `nest-pull` | Git pull from ~/nest |
| `nest-logs` | Tail PM2/Docker logs |
| `nest-status` | Full VM health check |
| `nest-restart` | Restart services via docker-compose |
| `nest-market` | USD/ZAR forex + grain market |
| `nest-pipeline` | Active deal pipeline |
| `nest-discord` | Discord bot status |
| `nest-today` | Today's date + SA time + ADAM work |
| `nest-help` | Show all commands |

## Architecture

```
~/nest/
├── agents/discord-bot/index.js     (port 3001)
├── ntechlab-workspace/index.js      (port 5001)
├── war-room/                        (port 5000)
├── docker-compose.yml
└── logs/
    └── *.log                        (PM2 logs)
```

## Requirements

- Ubuntu Linux (Orgo.ai VM)
- Docker + Docker Compose
- PM2 process manager
- curl (for market API)

## Author

Tumelo Ramaphosa — github.com/TumeloRamaphosa  
Founder: StudEx Global Markets  
AI: ADAM SMASHER AI CEO
