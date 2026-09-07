# Current System Map

Last audited: 2026-09-03

## Local control plane

| Component | Runtime | Current role |
|---|---|---|
| ClawX/OpenClaw | macOS process | Main local agent gateway |
| OpenClaw Dench | LaunchAgent | Secondary local profile |
| Hermes | LaunchAgent and containers | Agent gateway and workspace |
| PicoClaw | LaunchAgent | Lightweight local gateway |
| Ollama | macOS process | Offline model inference |
| Gitea | LaunchAgent | Local Git service |
| Buzz/Katya | OrbStack containers | Communications and dispatch |
| OrbStack | macOS VM/container runtime | Docker Compose runtime; currently requires repair |

## Current inventory

- 278 OpenClaw agent definitions
- 270 OpenClaw agency workspace directories
- 399 OpenClaw session files
- 43 Git repositories nested inside `.openclaw`
- Main `.openclaw` state uses approximately 5.9 GB

## External services

- Google Drive: shared business and agent-file exchange
- GitHub: reviewed code and portable configuration
- Gitea: frequent local mirrors
- Warmwind: cloud-computer research execution
- Orgo.ai: disposable computer-use workers
- Cloud model providers: Anthropic, OpenAI, MiniMax, MiMo, OpenRouter, Perplexity, Cursor, OpenCode, and Nous Hermes

## Current risks

- OrbStack reports stopped while helper processes and forwarded ports remain active.
- The internal Data volume is nearly full.
- OpenClaw has far more configured identities than the expected active team.
- Gitea synchronization currently reports an authentication failure.
- Obsidian automation is split across multiple scripts and schedules.
- A gateway credential exposed during diagnostics must be rotated before remote exposure.
