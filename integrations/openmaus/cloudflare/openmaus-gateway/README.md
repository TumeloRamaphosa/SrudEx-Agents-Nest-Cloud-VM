# StudEx OpenMaus cloud gateway

OpenAI-compatible chat endpoint on Cloudflare Workers AI. OpenMausBot stays
on the Mac (loopback `:18799`) and is reached through Cloudflare Tunnel at
`https://maus.studex-group.com`. This Worker is the cloud-only brain for when
the Mac is off, or for bots pointed at a Cloudflare model.

## Deploy

```bash
cd ~/studex-cloudflare/workers/openmaus-gateway
npx wrangler login
npx wrangler deploy
npx wrangler secret put GATEWAY_TOKEN
npx wrangler secret put OPENROUTER_API_KEY   # optional
```

Then add a second OpenMausBot instance:

```json
"cfWorkers": {
  "driver": "openai-compat",
  "displayName": "Cloudflare Workers AI",
  "environment": { "CF_GATEWAY_TOKEN": "<same token>" },
  "config": {
    "url": "https://studex-openmaus-gateway.<account>.workers.dev/v1",
    "apiKeyEnv": "CF_GATEWAY_TOKEN",
    "model": "@cf/meta/llama-3.1-8b-instruct"
  }
}
```

## Routes

| Method | Path | Auth |
|---|---|---|
| GET | `/health` | none |
| GET | `/v1/models` | Bearer `GATEWAY_TOKEN` |
| POST | `/v1/chat/completions` | Bearer `GATEWAY_TOKEN` |
