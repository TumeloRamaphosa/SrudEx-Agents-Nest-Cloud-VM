# Grok Bot Seats vs OpenClaw Inventory

**Document type:** inventory clarification (not a live health check)  
**Audit basis:** 2026-09-03 Mac audit + Company OS / Stud-Bot roster names  
**Last doc update:** 2026-09-07 (Nest mirror — **does not refresh live seat status**)

> **Audit staleness:** Seat *names* below are documented roster slots. Whether each Grok seat is provisioned, billed, or responding today was **not re-verified** after 2026-09-03. Run a fresh Mac / Company OS pass before claiming current.

---

## Two different inventories — do not conflate

| Dimension | **Grok Bot seats** | **OpenClaw agents** |
|-----------|-------------------|---------------------|
| **What it is** | Named org/product roles on **Company OS / Stud-Bot** (xAI Grok-backed agent slots) | Local Mac **OpenClaw runtime identities** under `~/.openclaw/` |
| **Typical count** | **Small roster** (single digits — see table below) | **278** at 2026-09-03 audit |
| **Where configured** | Company OS / Stud-Bot product layer (outside this Nest repo) | ClawX, OpenClaw, Hermes, agency workspaces on Mac |
| **Nest repo evidence** | Documented here by name only — no Grok API config in tree | Indirect — cron sync, system map metrics |
| **Relationship** | Org-facing **seats** (who speaks for which function) | Implementation **identities** (how agents run locally) |

**One Grok seat ≠ one OpenClaw agent.** A single Grok seat (e.g. Robusca) may map to multiple OpenClaw identities, tools, or channels over time. The 278 OpenClaw count is an **identity sprawl problem** (risk R3) — not “278 Grok bots.”

---

## Grok Bot seats — Company OS / Stud-Bot roster (documented)

These are the **named Grok seats** in the Company OS / Stud-Bot layer as of the Claudio-CTO vault mirror. Infra context only — **no product offer numbers or pricing.**

| Seat | Layer | Typical mandate | Live status (2026-09-03 audit) |
|------|-------|-----------------|----------------------------------|
| **Cloud Agent Orchestrator** | Company OS | Cross-cloud agent coordination, delegation | ❓ not probed in Mac audit |
| **Robusca** | Company OS | Chief of Staff — orchestration, brain sync target | 🟡 brain sync cron exists; `robusca-brain/` empty in Nest |
| **Stud-Bot Product** | Stud-Bot | Product definition, scope, roadmap (infra-facing) | ❓ not probed |
| **Stud-Bot Delivery** | Stud-Bot | Delivery / execution agent slot | ❓ not probed |
| **Operating System** | Company OS | Agent OS / nest platform concerns | 🟡 Nest bootstrap in progress (PR #19) — runtime separate |
| **Content Chief** | Company OS | Content strategy seat (org role) | ❓ not probed |

**Not Grok seats (related but different runtime):**

| Name | Layer | Notes |
|------|-------|-------|
| **Claudio / Hermes** | Mac OpenClaw + CTO vault | CTO control plane (`cto/`) vs Hermes runtime — OpenClaw/Ollama stack, not counted in Grok roster above |
| **278 OpenClaw identities** | Mac `~/.openclaw/` | Runtime inventory — see [`current-system-map.md`](current-system-map.md) |

---

## OpenClaw inventory (same audit — for contrast)

From **2026-09-03** only:

| Metric | Value |
|--------|-------|
| OpenClaw agents | 278 |
| Agency workspaces | 270 |
| Sessions | 399 |
| `~/.openclaw` disk | ~5.9 GB |

Target hygiene: **<30 active OpenClaw identities** with explicit skill bundles (see [`../Skills/solo-founder-skills.md`](../Skills/solo-founder-skills.md)) — unrelated to Grok seat count.

---

## Bring-up implications

| Item | Action |
|------|--------|
| Grok seat provisioning | Verify in Company OS / Stud-Bot admin — not in Nest git |
| OpenClaw sprawl | P10 identity audit — reduce 278 → active set |
| Nest War Room registry | Separate HTTP API — agents register at `:5000` on VM; not Grok seats |
| Confusion check | When someone cites “agent count,” ask: **Grok seats (~7 named)** or **OpenClaw identities (278)**? |

---

## Related

- [`current-system-map.md`](current-system-map.md) — Mac stack + risks  
- [`../../docs/OS-BRINGUP-CHECKLIST.md`](../../docs/OS-BRINGUP-CHECKLIST.md) §6 — Grok vs OpenClaw checklist rows
