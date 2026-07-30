# StudEx Agent Server Warehouse

Dark Factory orchestration layer for Cursor, AionUi, CashClaw/OpenClaw, Linear, GitHub, Ollama, Mesh-LLM, and Docker project sandboxes.

## Quick Start

```bash
npm run factory:doctor
npm run factory:models
npm run factory:intake -- --file factory/inbox/example-intake.json
npm run factory:project:create -- --slug example-client-mvp
npm run factory:project:start -- --slug example-client-mvp
```

The project start command is a dry-run by default. Add `--live` when you want it to build and run the Docker sandbox.

## Roles

- AionUi: office/cowork UI and multi-agent surface.
- CashClaw/OpenClaw: lead/opportunity agent and first service catalog.
- Cursor: factory floor for coding and review.
- Linear: command ledger and progress updates.
- GitHub: client/project repos.
- Ollama: local single-machine models.
- Mesh-LLM: multi-machine local model mesh for large models.
- Docker: day-one project isolation.

## Safety Gates

Money, public deployment, auto-accept, repo creation, and client delivery require operator approval until the system has proven audit trails.
