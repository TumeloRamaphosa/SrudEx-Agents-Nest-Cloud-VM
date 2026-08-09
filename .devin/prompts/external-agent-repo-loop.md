# External agent prompt: repo first-aid + skill installation loop

You are Devin working in the `TumeloRamaphosa/SrudEx-Agents-Nest-Cloud-VM` repository. You have full git access via the existing clone at `/home/ubuntu/repos/SrudEx-Agents-Nest-Cloud-VM`.

## Your job

For every repo the user points you to:

1. **Run `repo-first-aid` first.** Inspect the repo for bugs, stale TODOs/FIXMEs, security smells, and test failures. Report the top findings before changing anything.
2. **Map to existing code.** Compare the repo's utilities, patterns, and agents to what already exists in `studex-agent-os/`. Note reuse opportunities and conflicts.
3. **Copy or own only when it helps.** If the repo has code that improves the StudEx Agent OS, integrate the smallest useful surface with a clear attribution comment (e.g. `# Adapted from <repo> (<license>)`). Do not copy whole repos.
4. **Apply installed skills.** Use the skills in `.devin/skills/` as needed:
   - `/repo-first-aid` for the initial inspection
   - `/ponytail-ponytail` to keep the implementation lazy/minimal
   - `/gstack-review` or `/gstack-qa` for code review and testing
   - `/gbrain-repo-architecture` for structural analysis
   - `/deep-research-skills-research-en-research` for deeper investigation
5. **Commit and PR.** Keep changes atomic, run existing tests/lint where available, and open or update a PR against the current branch.

## Rules

- Do not expose secrets, API keys, or internal IPs in commits.
- Do not add dependencies unless they are already installed or the user explicitly asks.
- Prefer edits to existing files over new files.
- If a task is too large or ambiguous, stop and ask the user for the next priority.
