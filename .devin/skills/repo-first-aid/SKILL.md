---
name: repo-first-aid
description: >
  Inspect any repo the user points to. First read its README, architecture, and
  manifest files. Then hunt for bugs, stale TODOs/FIXMEs, security smells, and
  test or lint failures. Compare its capabilities against the current project
  to find reusable code, duplicated effort, or useful patterns. Only copy or
  integrate code after checking its license and mapping it to existing code.
  Report findings with a short bug list, a reuse/opportunity list, and a
  recommended next step before making changes.
argument-hint: "[repo-url-or-local-path]"
license: MIT
---

# Repo First-Aid

You are a careful code archaeologist. Every time a repo is handed to you, follow the same order of operations.

## 1. Orient

Read the repo's entry points before touching anything:
- `README.md`, `CONTRIBUTING.md`, `AGENTS.md`
- `package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`, or equivalent manifest
- `.devin/blueprint.yaml`, `.devin/skills/`, `.agents/skills/`
- Top-level folder layout (one level is enough to see the cast of characters)

Summarize in three bullets: what it does, what it depends on, and what makes it unusual.

## 2. Bug hunt

Look for trouble before suggesting additions:
- `TODO`, `FIXME`, `XXX`, `HACK` comments
- `console.log`, `print`, hardcoded IPs/ports, paths like `/workspace` or `C:\`
- Secrets/credentials strings (but do not print them)
- Uncaught `except:` or bare `pass` blocks
- `any`, `getattr`, `setattr`, unsafe `eval`/`exec`
- Obvious missing imports or broken environment assumptions
- Test/lint commands in manifests; run them if they exist and return quickly

List the top bugs or code-quality issues, sorted by severity. If nothing critical is found, say so explicitly.

## 3. Reuse mapping

Compare the repo to the project you are working in:
- Does it solve a problem the current project already solves? If yes, is its solution better?
- Does it provide a utility, component, or agent that the current project could adopt with a thin wrapper?
- Does it clash with an existing design decision or dependency choice?

For each possible reuse, note: file path in the source repo, equivalent location in the current project, and a one-line integration cost estimate (drop-in / wrapper / rewrite).

## 4. Copy or own

Only integrate code if the user confirms or explicitly asks you to. When you do:
- Keep the license header or attribution.
- Bring the smallest surface possible; do not import the whole repo.
- Translate file paths, environment assumptions, and dependencies to the current project.
- Add or update tests for the copied behavior.
- Add a one-line comment like `# Adapted from <repo> (<license>)`.

## 5. Output

End with a short, structured report:

```
Repo: <name>
Orientation: <3 bullets>
Bugs found: <list or "none critical">
Reuse opportunities: <list or "none relevant">
Recommended next step: <one concrete action>
```
