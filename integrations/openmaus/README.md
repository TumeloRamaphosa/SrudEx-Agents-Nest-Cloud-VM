# OpenMausBot + Hermes + Cloudflare (Mac command room)

Status as of 2026-09-08 on Tumelo's Mac (M1 Max). This is the local-first
command room that sits in front of The Nexus Agents Nest.

```
Phone / browser
    │  Cloudflare Tunnel (TLS)
    ▼
https://maus.studex-group.com
    │  never binds 0.0.0.0
    ▼
OpenMausBot harness  127.0.0.1:18799
    │
    ├─ Ollama local     127.0.0.1:11434   qwen2.5:14b / qwen2.5-coder:7b
    ├─ OpenRouter       openaiCompat      free-tier default
    ├─ Grok API         xai.key
    ├─ Claude Code      claude CLI
    ├─ Cursor Agent     cursor-agent
    ├─ Codex            ollama:: models for offline rooms
    ├─ Antigravity      agy
    ├─ OpenCode         opencode
    └─ Hermes ACP       hermes-acp
```

Hermes dashboard tunnel (unchanged): `https://hermes.studex-group.com` → `localhost:8085`.

## What is live on this Mac

| Piece | Version / note |
|---|---|
| OpenMausBot.app | Running, harness `127.0.0.1:18799` |
| OpenMausBot CLI | Node 24, `openmausbot` |
| Hermes Agent | v0.21.1, `hermes` / `hermes-acp` |
| Claude Code | 2.1.263 |
| OpenCode | 1.18.29 |
| Cursor Agent | `agent` / `cursor-agent` |
| Antigravity CLI | `agy` 1.0.3 |
| Ollama | tinyllama, gemma3:270m, qwen2.5:14b, qwen2.5-coder:7b, llama3.2:1b |
| Cloudflare Tunnel | `hermes-dashboard` → `maus.studex-group.com` and `hermes.studex-group.com` |
| Workers AI gateway | scaffolded, **not deployed** (`wrangler` not logged in) |

## Apply OpenMausBot engines (no secrets in git)

Keys live only in `~/.openmausbot/config.json` (mode 0600) and the shell env.
The example file in this folder has empty key fields.

```bash
# After copying, fill openaiCompat.key from OPENROUTER_API_KEY
cp integrations/openmaus/config.example.json ~/.openmausbot/config.json
chmod 600 ~/.openmausbot/config.json
# Restart OpenMausBot.app so engines reload
```

Existing offline rooms (PicoClaw, OpenClaw Fleet, Scribe, Forge, …) keep
Codex → Ollama. They were not rewritten.

## Public access

The desktop harness rejects non-loopback callers (`403 forbidden: loopback host required`).
That is correct. The tunnel is up; pairing is the missing step.

For phone/browser against the same data dir, quit OpenMausBot.app first, then:

```bash
openmausbot serve --port 18799 --public-url https://maus.studex-group.com
```

Do not run CLI serve and the desktop app at the same time — they share `messages.db`.

## Deploy the cloud Worker (optional, Mac-off inference)

```bash
cd integrations/openmaus/cloudflare/openmaus-gateway
npx wrangler login
npx wrangler deploy
npx wrangler secret put GATEWAY_TOKEN
npx wrangler secret put OPENROUTER_API_KEY
```

Then add the `cfWorkers` instance from `config.example.json`.

## Hermes

```bash
hermes                 # chat
hermes-acp             # ACP stdio for OpenMausBot
hermes setup           # keys / models
hermes gateway install # messaging + cron
```

OpenMausBot instance `hermesAcp` points at `hermes-acp`.
