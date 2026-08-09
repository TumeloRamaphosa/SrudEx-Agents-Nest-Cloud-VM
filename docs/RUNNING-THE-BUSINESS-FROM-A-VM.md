# Running StudEx from a single VM, with agents doing the work

This is the operating model for the repo as it stands today, plus the concrete gaps
between "impressive demo" and "the business actually runs on this". It is written to be
executed in order — each layer only makes sense once the one below it is real.

## 0. What already exists

| Piece | Where | State |
|---|---|---|
| War Room (content + comms dashboard, Express + React) | `war-room/` | Real app, real DB (Drizzle/SQLite) |
| Approval bot (Discord/Slack webhooks, human clearance) | `agents/approval-bot/` | Real, and the reason nothing auto-posts |
| Shopify / content-pipeline / Discord agents | `agents/` | Node services, run under Docker |
| Agent OS console (ADAM SMASHER, 5 agents) | `studex-agent-os/` | Flask console; **state is in-memory**, agent capabilities are largely stubbed |
| Grok chat + tool calling | `studex-agent-os/grok.py`, `orchestrator.py` | New: Grok reads live state and dispatches tasks |
| nest-cli operator commands | `studex-nest-cli/` | Real bash helpers (`nest-status`, `nest-logs`, …) |
| Compose stack + nginx | `docker/docker-compose.yml` | Real, single-host deployment |

So: the *interface* layer is strong, the *execution* layer is partly simulated. The
honest way to describe the system today is "a cockpit with some instruments wired to
real engines and some to demo data".

## 1. The rule that makes this safe

**Agents propose, humans dispose — for anything that leaves the building.**

Money movement, outbound email/social, contracts and pricing commitments go through
the approval bot. Grok is explicitly instructed it may draft anything and send nothing,
and `assign_task` only queues work. Keep this invariant as you add capability: every
new agent action is classified as either *read*, *internal write*, or *external effect*,
and only the first two ever run unattended.

## 2. Layer 1 — make the VM survivable

Nothing else matters if the box loses state.

1. **One state store, on disk.** Move `AGENTS`, `TASK_HISTORY` and `PIPELINE` out of
   Python module globals into SQLite (the War Room already has Drizzle + SQLite; reuse
   that DB rather than inventing a second one). Today an Agent OS restart erases the
   pipeline and every task ever dispatched.
2. **Process supervision.** PM2 or systemd for the Flask console and each Node agent;
   `restart: always` is already set in compose. `nest-status` should be the single
   truth for "is everything up".
3. **Backups.** Nightly `sqlite3 .backup` + `memory/` tarball to object storage
   (Backblaze B2 or S3), 30-day retention, and a documented restore that you have
   actually run once. A backup you have not restored is a rumour.
4. **Secrets.** One `.env` on the VM, `chmod 600`, never in git. `XAI_API_KEY`,
   Discord, Shopify, QuickBooks, Blotato, Fish Audio all live there. Rotate anything
   that has ever been pasted into a chat window.
5. **Access.** Tailscale for admin access; nginx exposes only what the public needs;
   no dashboard on the open internet without auth (see §5).

## 3. Layer 2 — give the agents real hands

Right now `research.search()` returns fabricated results and `markets` reads a cached
JSON file. Replace simulation with integrations, one agent at a time, cheapest first:

| Agent | Real capability to wire | How |
|---|---|---|
| Markets | USD/ZAR, Brent, gold, SA grain | Grok live search for narrative + a price API for numbers; cache to `memory/market-data.json` on a 15-min cron |
| Research | Counterparty and market intel | Grok live search with citations; write findings to `memory/research.md` so they persist |
| Deals | Pipeline as system of record | SQLite table; every stage change timestamped and attributed |
| Comms | Draft email/Discord/Lark | Existing AgentMail + approval bot; drafts only |
| Ops | VM health and deploys | Shell out to the real `nest-*` scripts instead of duplicating checks |
| Finance | Invoicing, margin, P&L | QuickBooks (client id/secret already provisioned) + the existing finance agent |

Rule of thumb: an agent is "real" when its output would survive being shown to a
counterparty. Until then label it in the UI as simulated — self-deception is the
expensive failure mode here.

## 4. Layer 3 — the daily loop (what "agents run it" actually means)

Cron on the VM, all times SAST:

```
06:00  markets   refresh FX/commodity prices, write memory/market-data.json
06:15  research  overnight scan: counterparties, SA meat/grain news → memory/research.md
06:30  ops       nest-status; if WARNING/CRITICAL → Discord alert
07:00  ADAM      morning brief: Grok reads all memory + pipeline → Discord #war-room
09:00  deals     stale-deal sweep: anything untouched 7+ days → task for comms
12:00  comms     draft follow-ups for stale deals → approval queue (never sent)
17:00  ADAM      EOD standup: what moved, what is blocked, tomorrow's top 3
21:00  ops       backup DB + memory to B2, verify checksum
```

The morning brief and EOD standup are the product. Everything else is plumbing that
makes those two messages trustworthy. Start with just those two on a cron and the
system already earns its keep.

## 5. Layer 4 — control surface

- **Auth on the console.** The Agent OS dashboard currently has none; the War Room has
  `requireApiKey` on state transitions. Put the console behind the same key (or
  Tailscale-only) before it holds real pipeline data.
- **Audit log.** Every `assign_task`, every approval, every external send: who/what,
  when, and the exact payload. Grok-initiated actions are already tagged `via: grok`.
- **Kill switch.** One command that stops all agent crons and outbound sending
  (`nest-freeze`), because the first time an agent misbehaves you will want it in
  seconds, not minutes.
- **Cost ceiling.** Track xAI token spend per day; alert past a threshold. Live search
  is billed per source used, so `mode: auto` (as configured) rather than `on`.

## 6. Where Grok fits, precisely

Grok is the **interface and the reasoner**, not the executor:

```
you ──chat──▶ /api/chat ──▶ Grok (tools) ──▶ get_status / get_pipeline / read_memory   (read)
                                        └──▶ assign_task                              (internal write)
                                             └──▶ agent runs ──▶ approval bot ──▶ send (human gate)
```

Because every factual claim comes back through a tool call that is visible in the UI
trace, you can audit the reasoning instead of trusting it. That property is worth more
than any prompt tuning.

## 7. Sequencing

1. **Session 1** — persist state to SQLite, auth on the console, backups + restore drill.
2. **Session 2** — wire markets + research to real data; morning brief and EOD standup on cron.
3. **Session 3** — finance/QuickBooks, deals as system of record, audit log + kill switch.

That is the whole path from cockpit to autopilot. The order matters more than the speed:
every layer above depends on state that does not vanish on reboot.
