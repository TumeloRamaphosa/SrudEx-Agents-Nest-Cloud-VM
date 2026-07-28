# StudEx AI Human — customization notes

This app is a rebrand/fork of the GPL‑v3 OpenHuman desktop app
(https://github.com/tinyhumansai/openhuman), vendored into this monorepo at
`apps/studex-ai-human/`. It remains **GPL‑v3** — the fork must stay open source
under the same license and keep upstream copyright/license notices.

## What has been rebranded (this PR)

- **App identity** — `app/src-tauri/tauri.conf.json`: `productName` → `StudEx AI Human`,
  `identifier` → `com.studex.aihuman`, window title → `StudEx AI Human`.
- **UI display strings** — `app/src/lib/i18n/en.ts`: all user‑facing "OpenHuman"
  → "StudEx AI Human" (welcome/onboarding/errors/etc.).
- **Install scripts** — `scripts/install.sh` / `scripts/install.ps1`: release repo
  pointer → `TumeloRamaphosa/SrudEx-Agents-Nest-Cloud-VM`; `curl … | bash` /
  `irm … | iex` help URLs → this repo's `apps/studex-ai-human/scripts/…` path.
- **Package manifest metadata** — Homebrew formula, Arch PKGBUILD/.desktop, npm
  `package.json`: display name, description, homepage/repo URLs.
- **README.md / INSTALL.md** — headline branding.

## Model analyzer + local/API choice (already built upstream, now branded)

The "detect what the machine can run → install a local model, or choose an API
model" flow the product needs **already exists** and is rebranded:

- Onboarding route order: `welcome` → `runtime-choice` → `custom/inference`
  (`app/src/pages/onboarding/Onboarding.tsx`).
- `app/src/pages/onboarding/steps/RuntimeChoiceStep.tsx` — local vs API choice.
- `app/src/pages/onboarding/steps/LocalAIStep.tsx` +
  `utils/localAiBootstrap.ts` — recommends & downloads a local model preset.
- `app/src/components/settings/panels/local-model/DeviceCapabilitySection.tsx`
  — detects device RAM and picks a model tier.
- Local models run via **Ollama**; the "API model" path uses hosted providers.

## TODO — release engineering (needs decisions + your credentials)

These are intentionally **not** finished here because they only matter once
StudEx publishes releases, and half‑editing them would be misleading:

1. **Git submodules** — the fork references 8 vendored submodules (CEF, tinyagents,
   tinyflows, etc.) via `.gitmodules`. They are NOT populated in this commit; a
   desktop build must `git submodule update --init --recursive` (or the vendor
   sources must be mirrored under the StudEx org).
2. **Release pipeline** — `.github/workflows/` here is not wired to run from the
   monorepo. A StudEx release workflow must build + publish installers
   (`.dmg`/`.msi`/`.deb`/AppImage) so the install scripts + package manifests
   resolve real assets.
3. **Artifact names / URLs** — package manifests still reference upstream
   `releases/download/...OpenHuman_*` asset names and the `OpenHuman` bundle
   binary. Finalize these to match the actual StudEx release artifacts +
   `productName` bundle output.
4. **Code signing** — signed macOS/Windows installers need StudEx's Apple
   Developer + Windows code‑signing certificates. Unsigned builds are fine for
   local testing.
5. **Internal identifiers left unchanged on purpose** — Rust crate name
   `openhuman`, env vars `OPENHUMAN_*`, config dir `~/.openhuman`, workspace
   package `openhuman-app`. Renaming these breaks the build/CI docs; keep as‑is
   unless a full internal rename is scheduled.

## Mobile (phase 2)

Upstream ships **desktop only**. The iOS client is experimental and non‑shipping;
there is no Android app and no on‑phone local model (Gemma/quantized) today.
On‑device mobile inference is a separate, larger effort.
