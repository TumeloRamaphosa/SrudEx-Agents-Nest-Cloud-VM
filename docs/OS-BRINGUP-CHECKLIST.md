# OS Bring-Up Checklist

**Owner:** Claudio (CTO layer)  
**Repo:** The-Nexus-Agents-NEst  
**Last updated:** 2026-09-07

Use this checklist to bring the **Agent OS / Nest layer** online. Status values are honest defaults for a fresh clone — update cells after you verify on your host.

**Legend:** ✅ verified | 🟡 partial / stale doc | ❌ not done | ❓ unknown

---

## 0. Prerequisites

| # | Step | Status | Notes |
|---|------|--------|-------|
| 0.1 | Clone repo | ❓ | `git clone https://github.com/TumeloRamaphosa/The-Nexus-Agents-NEst.git ~/nest` |
| 0.2 | Copy secrets template | ❓ | `cp .env.example .env` — fill locally, never commit |
| 0.3 | Docker + Compose installed | ❓ | Required for `docker/docker-compose.yml` |
| 0.4 | Node 22+ (for agents / War Room dev) | ❓ | Compose uses `node:22-alpine` images |
| 0.5 | Python 3 + Flask deps (optional Agent OS) | ❓ | `studex-agent-os/install.sh` |

---

## 1. Tailscale & network

| # | Step | Status | Notes |
|---|------|--------|-------|
| 1.1 | Tailscale on Mac | ❓ | Not configured in repo |
| 1.2 | Tailscale on VM | ❓ | WAR_ROOM_SPEC mentions VPN — no config here |
| 1.3 | Mac ↔ VM reachability | ❓ | Test: `curl http://<vm>:5000/api/health` |
| 1.4 | Private container registry over Tailscale | ❓ | **Unknown** — document URL in `cto/Systems/` when known |

---

## 2. Git remotes (GitHub / Gitea)

| # | Step | Status | Notes |
|---|------|--------|-------|
| 2.1 | GitHub origin | 🟡 | This repo; some nested docs still cite legacy name |
| 2.2 | Gitea mirror | ❌ | Not in repo |
| 2.3 | `nest-pull` / deploy user | 🟡 | `studex-nest-cli/nest-pull` expects `~/nest` |
| 2.4 | GitHub Actions CI | ❌ | No workflows directory |

---

## 3. OpenClaw map (Mac local)

| # | Step | Status | Notes |
|---|------|--------|-------|
| 3.1 | OpenClaw installed on Mac | ❓ | Outside repo |
| 3.2 | Skills directory in Nest | ❌ | Root `skills/` missing — use `cto/Skills/` scaffold |
| 3.3 | ClawX gateway documented | ❌ | See `cto/Systems/mac-local-stack.md` |
| 3.4 | OpenClaw → VM task queue | ❌ | No automation in repo |
| 3.5 | AgentMail webhook → OpenClaw | 🟡 | Described in Obsidian ops doc — re-validate |

---

## 4. Hermes / Agent OS

| # | Step | Status | Notes |
|---|------|--------|-------|
| 4.1 | Hermes persona / email documented | 🟡 | `hermes@agent.studexmeat.com`, War Room CTO line |
| 4.2 | `studex-agent-os` install | ❓ | `./install.sh && python3 app.py` |
| 4.3 | Hermes MC URL in Agent OS README | 🟡 | External URL cited — may be stale |
| 4.4 | Claudio vault ↔ Hermes alias | 🟡 | Intentional split until merged — see `cto/HOME.md` |
| 4.5 | Port conflict War Room vs Agent OS | ❓ | Both default :5000 — run one primary |

---

## 5. Grok Bot seats

| # | Step | Status | Notes |
|---|------|--------|-------|
| 5.1 | Grok bot identities defined | ❓ | **Not referenced in repo** |
| 5.2 | Seat allocation / API access | ❓ | Document in `cto/Systems/` when confirmed |
| 5.3 | War Room / Discord integration | 🟡 | Discord bot code in `agents/discord-bot/` — needs tokens |

---

## 6. Always-on Nest stack (VM)

| # | Step | Status | Notes |
|---|------|--------|-------|
| 6.1 | `scripts/boot-nest.sh` | 🟡 | Added in bootstrap PR — thin wrapper |
| 6.2 | `docker compose -f docker/docker-compose.yml up -d` | ❓ | Verify agent volume paths on host |
| 6.3 | War Room health | ❓ | `GET /api/health` on :5000 |
| 6.4 | Nest CLI installed | ❓ | `studex-nest-cli/install.sh` → `nest-status` |
| 6.5 | Nginx :80 front door | ❓ | `docker/docker/nginx.conf` — verify upstreams |
| 6.6 | Shopify agent cron loop | ❓ | Needs Shopify API in `.env` |
| 6.7 | Approval + content pipeline | ❓ | Needs `APPROVAL_HOOK`, Higgsfield keys |

---

## 7. Observability & hygiene

| # | Step | Status | Notes |
|---|------|--------|-------|
| 7.1 | Daily log in `memory/` | 🟡 | Historical entries exist |
| 7.2 | CTO weekly report | ❌ | Use `cto/Reports/TEMPLATE-weekly-status.md` |
| 7.3 | No secrets in git | 🟡 | Audit before push — `.env.example` only |
| 7.4 | `robusca-brain/` populated | ❌ | Empty — sync from CoS workspace |

---

## 8. Boot sequence (recommended order)

```bash
cd ~/nest   # or your clone path

# 1. Secrets
test -f .env || { cp .env.example .env; echo "Edit .env before continuing"; exit 1; }

# 2. Optional: nest CLI
./studex-nest-cli/install.sh

# 3. Stack
./scripts/boot-nest.sh

# 4. Smoke tests
curl -sf http://localhost:5000/api/health && echo "war-room ok" || echo "war-room FAIL"
command -v nest-status >/dev/null && nest-status || true
```

---

## 9. Sign-off (fill when actually verified)

| Environment | Verified by | Date | War Room | Docker agents | Mac OpenClaw |
|-------------|-------------|------|----------|---------------|--------------|
| Local dev | | | ❓ | ❓ | ❓ |
| Orgo VM | | | ❓ | ❓ | ❓ |

Do not mark ✅ without running the smoke tests on that environment.
