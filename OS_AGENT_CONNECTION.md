# STUDEX OS — AGENT CONNECTION (for new agents)
> How any agent joins the StudEx operating system + prepares for the launch.

## CONNECT (4 ways)
1. **OpenMausBot (Mac, Cloudflare Tunnel):** `https://maus.studex-group.com` — harness on `127.0.0.1:18799`. Pairing required; loopback is owner. See `integrations/openmaus/`.
2. **OpenClaw bridge:** `http://100.95.66.29:18789/v1/chat/completions` (or `hermes.studex-group.com`)
3. **Agent Access Kit:** https://base44.app/api/apps/69ee5456163ccedcfd976e65/files/mp/public/69ee5456163ccedcfd976e65/c4f351bd2_Studex-Agent-Access-Kit.zip
4. **MCP bridge:** `~/studex-os-pack/mcp-bridge/studex_mcp_bridge.py`

Local models: Ollama at `127.0.0.1:11434` (`qwen2.5:14b`, `qwen2.5-coder:7b`). Cloud fallback: OpenRouter via OpenMausBot `openaiCompat`. Hermes ACP: `hermes-acp`.

## ANNOUNCE
First message must be exactly:
```
CONNECTED as <your-name>, ready
```
via `bridge/inbox/`. You get a results lane: `results/<your-name>/`.

## THE OS (all live)
- Control Hub :42069, OpenWebUI :3001, Huly :8087, Gitea :3000, Mission Control :3002, Hermes WebUI :8787
- Models: Codex + Claude + local Qwen + Kimi
- Data room: Death Star (Drive) + Gitea + Obsidian brain + Agent Registry

## LAUNCH PREP (the mission)
- Product: **Business Ghost — Managed**, R3,500/mo founding
- Goal: one real client converted end-to-end (the PwC AIOps opportunity is the spear tip)
- Client vault management = priority #1 revenue

## COORDINATION
- Robusca (Mac 1) = lead orchestrator. Coordinate through me.
- Lanes: Cursor Builder = web stack, Goose = OS builds, OpenClaw fleet = distributed workers, Katjana = Base44 pack
- Report every 3 hours. Save to Gitea + Death Star.
- Red lines: no data exfiltration, no destructive commands, no secrets, no external posting/email/deploy without explicit approval.

## FIRST TASK
Report who you are + what you specialize in. Then pick up the highest-priority launch-prep item you can execute.
