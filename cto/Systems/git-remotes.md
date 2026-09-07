# Git Remotes & Registry

**Status:** partial — GitHub canonical; Gitea/Tailscale registry not configured in repo.

## Canonical remote

| Remote | URL | Role |
|--------|-----|------|
| **origin** | `https://github.com/TumeloRamaphosa/The-Nexus-Agents-NEst` | Primary Nest repo (this checkout) |

## Legacy names (still in docs/scripts)

Several paths reference the older repository name:

- `SrudEx-Agents-Nest-Cloud-VM`
- `github.com/TumeloRamaphosa/SrudEx-Agents-Nest-Cloud-VM`

Files still using legacy URLs include `studex-nest-cli/*`, `studex-agent-os/README.md`, and `studex-obsidian-vault/00-Core/INDEX.md`. **Migration to The-Nexus-Agents-NEst is in progress** — update references as part of CTO hygiene, not in one blind replace.

## Gitea / self-hosted

| Item | Status |
|------|--------|
| Gitea instance URL | **Unknown — not in repo** |
| Mirror of this repo | **Not configured here** |
| CI on Gitea | **Not configured here** |

## GitHub

| Item | Status |
|------|--------|
| Repo exists | Yes — `The-Nexus-Agents-NEst` |
| GitHub Actions | **No `.github/workflows` in repo** |
| Branch protection | **Unknown** |

## Tailscale / private registry

| Item | Status |
|------|--------|
| Tailscale mesh for VM ↔ Mac | Mentioned in `war-room/WAR_ROOM_SPEC.md` as SSH/tunnel option — **no tailscale config in repo** |
| Container registry via Tailscale | **Unknown** |

Do not commit Tailscale auth keys or Gitea tokens. Store in local `.env` or secret manager only.
