# OS Bring-Up Checklist

**Owner:** Claudio-CTO  
**Repo:** The-Nexus-Agents-NEst  
**Last updated:** 2026-09-07 (Nest mirror of vault audit **2026-09-03**)  
**Overall status:** 🔴 **degraded** — do not treat this stack as production-ready

> **Audit staleness:** Checklist status rows inherit the **2026-09-03** Mac audit unless you re-verify locally. This file was edited for Nest bootstrap / Robusca nits on 2026-09-07 — that is **not** a fresh health pass. Run a new Mac walk before upgrading any 🔴 to ✅.

**Legend:** ✅ verified | 🟡 partial | 🔴 failing / degraded | ❌ not done | ❓ unknown

Point-in-time detail: [`cto/Reports/2026-09-03-status.md`](../cto/Reports/2026-09-03-status.md)

---

## Priority queue (work in this order)

| P | Item | Status | Blocker / note |
|---|------|--------|----------------|
| **P0** | Rotate exposed gateway credential | 🔴 | **Before** Tailscale or public exposure — R6 |
| **P1** | Nest repo bootstrap (cto vault + docs) | 🟡 | PR #19 — structure mirrored; runtime separate |
| **P2** | Fix Gitea auth | 🔴 | Agent sync 30m cron push failing |
| **P3** | Repair OrbStack | 🔴 | Stopped but ports still active — Buzz/Katya down |
| **P4** | Free disk space | 🔴 | Volume nearly full; ~5.9GB `.openclaw` + sessions |
| **P5** | Tailscale reconnect (Mac1 registry) | 🔴 | Private registry access |
| **P6** | WhatsApp / Hermes channel | 🔴 | Hourly poll reports disconnected |
| **P7** | Restore Ollama for Hermes | 🔴 | Local inference degraded |
| **P8** | Install Claudio 6h status cron | ❌ | Not installed in `skunk-works/cron/` |
| **P9** | Fix daily backup cron | 🔴 | Broken — fix after disk stable |
| **P10** | OpenClaw identity audit (278 → target <30) | ❌ | Too many configured identities |

---

## 0. Nest repo bootstrap

| # | Step | Status | Notes |
|---|------|--------|-------|
| 0.1 | Clone `The-Nexus-Agents-NEst` | 🟡 | GitHub canonical |
| 0.2 | `cto/` vault mirrored | 🟡 | HOME, Systems, Automations, Skills, Drive, Reports |
| 0.3 | `cp .env.example .env` locally | ❓ | Never commit |
| 0.4 | `./scripts/boot-nest.sh` on VM | ❓ | War Room + docker agents |
| 0.5 | Populate `robusca-brain/` | ❌ | Empty — brain sync hourly cannot land here yet |

---

## 1. Security & credentials

| # | Step | Status | Notes |
|---|------|--------|-------|
| 1.1 | No secrets in Obsidian / Drive / Git | 🟡 | Policy in `cto/HOME.md` — enforce on sync |
| 1.2 | Gateway credential rotation | 🔴 | Required before remote exposure |
| 1.3 | Gitea credentials valid locally | 🔴 | Auth failure blocks sync |
| 1.4 | `.env` only on hosts | 🟡 | Nest `.env.example` has names only |

---

## 2. Tailscale & Mac1 registry

| # | Step | Status | Notes |
|---|------|--------|-------|
| 2.1 | Tailscale on Mac (Mac1) | 🔴 | Reconnect needed for registry |
| 2.2 | Tailscale on VM | ❓ | WAR_ROOM_SPEC mentions VPN — not verified |
| 2.3 | Mac1 private container registry | 🔴 | Blocked until Tailscale up |
| 2.4 | Mac ↔ VM `curl :5000/api/health` | ❓ | VM fleet cron 3h — unverified |

---

## 3. Gitea & Git remotes

| # | Step | Status | Notes |
|---|------|--------|-------|
| 3.1 | GitHub origin (Nest) | 🟡 | Some nested docs still cite legacy repo name |
| 3.2 | Gitea push from agent sync (30m) | 🔴 | **Failing** — fix auth |
| 3.3 | Brain sync hourly → git | 🟡 | Target repo empty |
| 3.4 | GitHub Actions CI | ❌ | No workflows |

---

## 4. Mac local runtime (OpenClaw stack)

| # | Step | Status | Notes |
|---|------|--------|-------|
| 4.1 | ClawX + OpenClaw | 🟡 | 278 agents, 270 workspaces, 399 sessions |
| 4.2 | OpenClaw Dench | 🟡 | Separate instance |
| 4.3 | PicoClaw | 🟡 | Present |
| 4.4 | OrbStack → Buzz/Katya | 🔴 | OrbStack **stopped**, ports active |
| 4.5 | `skunk-works/cron/` jobs documented | 🟡 | See `cto/Automations/schedule.md` |
| 4.6 | Obsidian automation split resolved | ❌ | Consolidate to one schedule doc |
| 4.7 | OpenClaw → Nest task queue | ❌ | Not wired in repo |

---

## 5. Hermes & channels

| # | Step | Status | Notes |
|---|------|--------|-------|
| 5.1 | Hermes heartbeat (15m) | 🟡 | Runs — agent still degraded |
| 5.2 | Ollama backend | 🔴 | Degraded |
| 5.3 | WhatsApp on Hermes | 🔴 | Disconnected — hourly poll fails |
| 5.4 | AgentMail / CTO line | 🟡 | Documented in War Room — live status unknown |
| 5.5 | Claudio vs Hermes roles | 🟡 | Claudio = control plane; Hermes = runtime |

---

## 6. Grok Bot seats (Company OS / Stud-Bot)

**Not the same as 278 OpenClaw agents** — see [`cto/Systems/grok-bot-seats.md`](../cto/Systems/grok-bot-seats.md).

| # | Step | Status | Notes |
|---|------|--------|-------|
| 6.1 | Grok seat roster documented | 🟡 | ~7 named seats: Cloud Agent Orchestrator, Robusca, Stud-Bot Product, Stud-Bot Delivery, Operating System, Content Chief |
| 6.2 | Grok vs OpenClaw distinction | 🟡 | Grok = org seats; OpenClaw 278 = Mac runtime identities (R3 sprawl) |
| 6.3 | Live Grok seat provisioning | ❓ | **Not probed in 2026-09-03 audit** — verify in Company OS / Stud-Bot admin |
| 6.4 | Discord bot (Nest) | 🟡 | Code in `agents/discord-bot/` — needs tokens; separate from Grok seats |

---

## 7. VM / Nest always-on stack

| # | Step | Status | Notes |
|---|------|--------|-------|
| 7.0 | **Port 5000 conflict resolved per host** | 🔴 open (R9) | War Room (`/api/health`) vs Agent OS (`/health`) — see below |
| 7.1 | `docker compose up` | ❓ | `scripts/boot-nest.sh` |
| 7.2 | War Room `:5000/api/health` | ❓ | Not re-audited 2026-09-03 |
| 7.3 | Nest CLI `nest-status` | ❓ | `studex-nest-cli/install.sh` |
| 7.4 | VM fleet cron (3h) | 🟡 | Scheduled — result unverified |
| 7.5 | Shopify / content agents | ❓ | Need `.env` |
| 7.6 | Agent OS **not** on :5000 alongside War Room | 🔴 | Run War Room OR Agent OS on 5000 — not both |

### Port 5000 — open risk (R9)

| Listener | Source | Endpoint | When to use |
|----------|--------|----------|-------------|
| **War Room** | `docker/docker-compose.yml` | `http://localhost:5000/api/health` | VM / always-on primary |
| **Agent OS** | `studex-agent-os/app.py` | `http://localhost:5000/health` | Dev only — **different path, same port** |

**Impact:** Second process fails to bind, or `boot-nest.sh` talks to the wrong app. **Check:** `lsof -i :5000` before compose up.

**Avoid:** `python3 studex-agent-os/app.py` on a host already running War Room compose.

Detail: [`cto/Systems/current-system-map.md`](../cto/Systems/current-system-map.md) (R9), [`cto/Systems/nest-topology.md`](../cto/Systems/nest-topology.md).

---

## 8. Observability & backup

| # | Step | Status | Notes |
|---|------|--------|-------|
| 8.1 | Claudio 6h auto status | ❌ | Not installed |
| 8.2 | Daily backup | 🔴 | Broken |
| 8.3 | CTO reports in `cto/Reports/` | 🟡 | 2026-09-03 snapshot present |
| 8.4 | Drive exchange contract | 🟡 | Documented — folders may not exist on disk yet |

---

## 9. Boot sequence

### Nest VM (when host is healthy)

```bash
cd ~/nest
test -f .env || { cp .env.example .env; echo "Edit .env locally"; exit 1; }
./scripts/boot-nest.sh
curl -sf http://localhost:5000/api/health || echo "war-room FAIL"
```

### Mac recovery (before VM work)

1. Rotate gateway credential (P0)
2. Fix Gitea auth → verify agent sync push
3. Repair OrbStack → confirm Buzz/Katya
4. Reconnect Tailscale Mac1 → registry
5. Reconnect WhatsApp on Hermes
6. Free disk → then fix daily backup

---

## 10. Sign-off

| Environment | Date | Nest boot | Gitea sync | OrbStack | WhatsApp | Tailscale |
|-------------|------|-----------|------------|----------|----------|-----------|
| Mac local | 2026-09-03 | n/a | 🔴 | 🔴 | 🔴 | 🔴 |
| Orgo VM | | ❓ | ❓ | n/a | ❓ | ❓ |

Update this table only after smoke tests — never mark ✅ from docs alone.
