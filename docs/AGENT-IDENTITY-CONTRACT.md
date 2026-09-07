# Agent Identity Contract — Rooms ↔ Nest ↔ OpenClaw

**Owner:** Operating System (Grok Agent OS)  
**Consumers:** NEXUS, War Room, OpenClaw gateway, Claudio-CTO  
**Status:** v0 draft — 2026-09-07  
**Depends on:** PR #19 `cto/` bootstrap; wiring after merge + always-on host

## Decision: mapping model

**Not 1:1 OpenClaw → OS agents.** OpenClaw has ~278 configured identities; Grok Agent OS seats ~15 named agents.  

**Canonical identity** lives in **Agent OS** (Grok seat).  
**Nest gateway seat** is the bridge.  
**OpenClaw** identities attach as *aliases / executors* under a Nest seat (many OpenClaw → one OS agent, or unassigned pool).

```
Grok Agent OS seat  ←canonical→  Nest gateway seat  ←aliases→  OpenClaw agent id(s)
     (room member)                    (War Room)                  (local runtime)
```

## Identity record (register payload)

`POST /api/agents/register`

```json
{
  "os_agent_id": "uuid",
  "os_name": "string",
  "nest_seat": "kebab-id",
  "source": "grok-os | openclaw | hermes | nest-vm | human",
  "capabilities": ["string"],
  "rooms": ["company-os", "fleet-command", "verticals", "coffee-buzz"],
  "lane": "infra | product | delivery | content | coffee | client | markets | research",
  "permissions": {
    "can_draft": true,
    "can_publish": false,
    "can_spend": false,
    "can_deploy": false,
    "can_message_external": false
  },
  "audit": {
    "human_gates": ["publish", "spend", "shopify", "credentials"],
    "approval_required_for": ["publish", "spend", "deploy", "client_send"]
  },
  "openclaw_aliases": ["buzz-naledi", "studio-operations"],
  "status": "active | standby | degraded | disabled"
}
```

### Required fields
`os_name` (or `name`), `source`, `capabilities[]`, `permissions`, `status`

### Optional but preferred
`os_agent_id` (Grok UUID when known), `nest_seat`, `rooms[]`, `lane`, `openclaw_aliases[]`, `audit`

## Current Grok seats → Nest seats (seed)

| OS name | Grok id | nest_seat | lane | OpenClaw aliases (known) |
|---------|---------|-----------|------|--------------------------|
| Operating System | `10e1db60-80ea-4db5-8266-541fa4c776ff` | `operating-system` | infra | — |
| NEXUS | `fad5c37a-e30b-47f9-9fb7-8f7922f06a4c` | `nexus` | infra | — |
| Adam Smasher | `0eaa27a9-91cb-41ff-baa0-40eae25f4bbc` | `adam-smasher` | infra | — |
| Robusca | `4854eaf2-16b2-42ea-bb93-6bc873d09996` | `robusca` | ops | `buzz-robusca-prime` |
| Stud-Bot Product | `633be263-9006-4fa6-93e0-58744d27778c` | `studbot-product` | product | — |
| Stud-Bot Delivery | `a850c568-0ba7-40dd-b815-f419108424b6` | `studbot-delivery` | delivery | — |
| Content Chief | `6b2ccb45-f80c-4a9b-a1df-93f044e120a9` | `content-chief` | content | — |
| Infulencial | `8a6fefd9-79ac-4053-9cc9-180085c0411b` | `infulencial` | content | — |
| Cloud Agent Orchestrator | `1d051aaa-f1fd-49c6-95c1-124f3a12bce3` | `cloud-orchestrator` | infra | — |
| LLM ENGINEER | `228814e1-2d93-417b-8139-90088037c409` | `llm-engineer` | infra | — |
| Coffee | `855c7539-65e9-4806-9879-7e5f31a3e362` | `coffee` | coffee | — |
| Cryptopia | `42dcd341-91ff-4d60-ad1f-fc63819c1888` | `cryptopia` | markets | — |
| Bohlale | `eac5c2f8-6316-4cae-aef6-b2a9e98adfe4` | `bohlale` | client | — |
| Katjana | *(Base44 registry)* | `katjana` | sales | — |

Unmapped OpenClaw identities stay in pool `openclaw-unassigned` until audited (bring-up P10).

### Katjana (Base44 seat — expanded seed)

Not a Grok Agent OS UUID seat today. Canonical record for Nest registration and fleet join docs.

| Field | Value |
|-------|-------|
| `os_name` | Katjana |
| `os_agent_id` | Base44 registry (**no Grok UUID yet**) |
| `nest_seat` | `katjana` |
| `lane` | `sales` |
| `source` | `base44` |
| WhatsApp | +1 (703) 457-1882 — public agent line |
| Join path | [`AGENT-JOIN.md`](../AGENT-JOIN.md) + [`mcp-bridge/`](../mcp-bridge/) |
| `openclaw_aliases` | — *(map `~/.openclaw/workspace/agents/katjana.md` when verified on Mac)* |
| `status` | `standby` until Nest register + bridge wired |

**Permissions** — fail-closed (same fleet default): `can_draft=true`; `can_publish`, `can_spend`, `can_deploy`, `can_message_external` = `false` until Agent Lord grants. External WhatsApp replies that qualify as `client_send` require approval per routing rules.

Example register payload:

```json
{
  "os_name": "Katjana",
  "os_agent_id": "base44-registry",
  "nest_seat": "katjana",
  "source": "base44",
  "capabilities": ["sales", "client-draft", "mcp-bridge"],
  "rooms": [],
  "lane": "sales",
  "permissions": {
    "can_draft": true,
    "can_publish": false,
    "can_spend": false,
    "can_deploy": false,
    "can_message_external": false
  },
  "audit": {
    "human_gates": ["publish", "spend", "shopify", "credentials", "client_send"],
    "approval_required_for": ["publish", "spend", "deploy", "client_send"]
  },
  "openclaw_aliases": [],
  "channels": {
    "whatsapp_public": "+1-703-457-1882"
  },
  "status": "standby"
}
```

## Squad routing (`POST /api/tasks`)

```json
{
  "task_id": "uuid",
  "agent": "nest_seat or os_name",
  "task": "kebab-action",
  "priority": "low | normal | high | p0",
  "room": "optional-room-slug",
  "payload": {},
  "requires_approval": false
}
```

### Routing rules
1. Resolve `agent` → Nest seat → OS seat; if only OpenClaw alias, route via owning Nest seat or reject to `openclaw-unassigned`.
2. If `requires_approval` or action ∈ {publish, spend, deploy, shopify, client_send} → queue for Tumelo; do not execute.
3. Squad = 2–5 seats max per task; OS picks from lane + room membership.
4. Cross-lane tasks (e.g. Coffee claims in Stud-Bot copy) → reject; OS enforces lane purity.
5. Prefer Nest/War Room for always-on; OpenClaw for local Mac executors; Grok rooms for human-visible coordination.

## Permissions defaults
All Nest-registered agents: `can_draft=true`; `can_publish/spend/deploy/message_external=false` until Tumelo grants.

## Audit
Every register + task create/complete writes: timestamp, seat, action, room, approval state, artifact link. No credentials in audit payloads.

## Non-goals
- Do not sync all 278 OpenClaw agents into Grok rooms
- Do not put secrets in `cto/` or this contract
- Stud-Bot founding (PR #28) stays separate from Nest infra bring-up
