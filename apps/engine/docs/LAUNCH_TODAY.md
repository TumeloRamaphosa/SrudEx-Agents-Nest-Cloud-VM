# Launch Today

This is the same-day launch path for the StudEx Dark Factory MVP.

## 1. Verify Local Tools

```bash
npm run factory:doctor
```

Expected local services:

- `ollama` at `http://localhost:11434`
- `mesh-llm` at `http://localhost:9337/v1` when running
- Docker through OrbStack or Docker Desktop
- GitHub CLI authenticated as `TumeloRamaphosa`
- Tailscale online for private machine access

## 2. Refresh Model Routing

```bash
npm run factory:models
```

Observed Ollama models are written to `factory/config/model-routing.json`. Mesh-LLM is reserved for heavy local models that run on the best GPU machine.

## 3. Start Mesh-LLM

On the GPU machine:

```bash
mesh-llm serve --model Qwen3-8B-Q4_K_M
```

On API-only Cursor machines:

```bash
mesh-llm --client --join <invite-token>
```

Keep this private over Tailscale or invite tokens. Do not use `--publish` for client work.

## 4. Process a Client Request

Create an intake JSON in `factory/inbox/live-CLIENT.json`, then run:

```bash
npm run factory:intake -- --file factory/inbox/live-CLIENT.json
```

This creates a Linear-style dry-run payload in `factory/intakes/`. Use `--live` only after Linear credentials and team/project IDs are set.

## 5. Create a Project Sandbox

```bash
npm run factory:github -- create-repo --name client-project
npm run factory:project:create -- --slug client-project
npm run factory:project:start -- --slug client-project
```

GitHub repo creation is dry-run by default. Add `--live --approved` only after you approve the project:

```bash
npm run factory:github -- create-repo --name client-project --live --approved
```

Add `--live` to start the Docker container:

```bash
npm run factory:project:start -- --slug client-project --live
```

If Docker returns an input/output error under `/var/lib/docker`, restart Docker Desktop or OrbStack before retrying. The factory scripts intentionally keep the dry-run path available so intake, Linear payloads, and repo planning can continue while Docker storage is repaired.

## 6. Launch AionUi Office

From `/Users/tumeloramaphosa/AionUi`:

```bash
bun install
bun run webui:prod:remote
```

Configure local model providers:

- Ollama: `http://localhost:11434`
- Mesh-LLM OpenAI-compatible: `http://localhost:9337/v1`

## 7. Launch CashClaw Lead Agent

From `/Users/tumeloramaphosa/cashclaw`:

```bash
npm install
npm start -- status
```

Initialize only when ready to create `~/.cashclaw/`:

```bash
npm start -- init
```

Keep HYRVE polling and auto-accept off until pricing, approval, and payment rules are confirmed.
