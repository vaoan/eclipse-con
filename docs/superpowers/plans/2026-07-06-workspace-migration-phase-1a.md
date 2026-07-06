# Workspace Migration (Phase 1a) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert this single-app repo into a pnpm workspace and relocate the moonfest site into a self-contained `apps/moonfest2026/`, with every pnpm action verified green and the live site never redeployed.

**Architecture:** Add a workspace root (`pnpm-workspace.yaml` + slim root `package.json`) on top of the existing project. Move all moonfest-app files under `apps/moonfest2026/`; keep repo-wide tooling (eslint, prettier, stylelint, check-config files, husky) at root. Root scripts delegate to the app via `pnpm --filter moonfest2026`. This is a pure structural move — no source logic changes, no deploy.

**Tech Stack:** pnpm 10 workspaces, Vite 7, React 19, TypeScript 5, Cloudflare Workers (wrangler), Vitest, Playwright, ESLint 10 flat config, Husky + lint-staged.

**Spec:** `docs/superpowers/specs/2026-07-06-moonfest-monorepo-migration-design.md`

## Global Constraints

- **Never redeploy moonfest during this phase.** The live Worker at `moonfest.furrycolombia.com` keeps serving; only a human-approved `wrangler deploy` after the gate is green may change it. This plan runs `--dry-run` only.
- **Never** `git push --force` to `main`; **never** `--no-verify`; **never** `git add -A`/`git add .` — stage explicit paths.
- Conventional commits; every commit ends with `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- pnpm only (never npm/yarn); only `pnpm-lock.yaml` may exist.
- App package name is exactly `moonfest2026` (used by `pnpm --filter`). Folder is exactly `apps/moonfest2026/`.
- **The husky pre-commit hook runs on every commit** (`pnpm version:auto` → `git add …/.env.example` → `pnpm precommit`/lint-staged). Because it exercises the whole toolchain, the repo must be in a **toolchain-consistent state before any commit**: root `version:auto` must resolve, and lint-staged (prettier + eslint) must pass on staged files. This is why the relocation, the package.json split, and the path/husky fixes all land in **one** commit (Task 2).
- Secrets are NOT reorganized in this phase: `.env.local` / `.env.example` move into the app **as-is**. The shared-root-secrets split (spec §6) is deferred to Phase 1b (telegram-sync).
- Acceptance gate (must all pass before phase is "done"): `pnpm --filter moonfest2026 typecheck`, root `pnpm lint`, `pnpm --filter moonfest2026 test`, `pnpm --filter moonfest2026 build`, `pnpm --filter moonfest2026 build:static`, `wrangler deploy --dry-run` with the app config, and the husky `pre-commit` hook on a real staged change. `check:tools`/`check:style` and `test:e2e` are best-effort, not gating (both were already partially broken / gitignored pre-migration).

---

## Task 1: Land pending Telegram work and branch — ✅ COMPLETE

(Executed: commits `e6b0531` telegram tooling, `c93e707` news content; branch `chore/monorepo-migration-phase-1a`; tree clean; review clean, no secrets.)

The tree held finished, verified WSL self-heal Telegram tooling plus a synced news batch. It was committed in two logical commits (tooling; content) on `main`, then branch `chore/monorepo-migration-phase-1a` was created. This kept the pre-existing work out of the migration PR and gave Task 2 a clean tree.

---

## Task 2: Relocate the app and rewire the toolchain (single consistent commit)

Move every moonfest file under `apps/moonfest2026/`, split `package.json`, and re-point everything that references old paths — then `pnpm install` and commit **once**. A single commit is mandatory: any commit made after `scripts/` moves but before the root `package.json`/husky are fixed would fail the pre-commit hook (`version:auto` → missing `scripts/bump-version.mjs`), and `--no-verify` is forbidden.

**Files:**

- Create: `pnpm-workspace.yaml`, `apps/moonfest2026/package.json`
- Modify: `package.json` (root → workspace root), `eslint.config.mjs`, `.husky/pre-commit`, `.gitignore`, `sync-telegram.cmd`, `sync-telegram.ps1`, `apps/moonfest2026/tsconfig.node.json` (after move)
- Move (git-tracked, `git mv`): `src`, `public`, `index.html`, `cloudflare`, `scripts`, `vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`, `playwright.analytics.config.js`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `wrangler.toml`, `components.json`, `.env.example`, `CLOUDFLARE-SETUP.md` → `apps/moonfest2026/`
- Move (untracked/gitignored, plain `mv`): `.env.local`, `e2e` → `apps/moonfest2026/`

**Interfaces:**

- Produces: workspace with app package `moonfest2026`. App scripts: `dev`, `build`, `build:static`, `preview`, `typecheck`, `test`, `test:e2e*`, `deploy:cloudflare*`, `fetch:telegram`, `translate:telegram`, `sync:telegram`, `version:auto`. Root delegating scripts: `pnpm --filter moonfest2026 <script>`; root also owns `lint` (`eslint .`), `format`, `check:*`, `precommit`, `prepare`.

- [ ] **Step 1: Create the workspace manifest**

Create `pnpm-workspace.yaml`:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

- [ ] **Step 2: Move the git-tracked app files**

```bash
mkdir -p apps/moonfest2026
git mv src public index.html cloudflare scripts \
  vite.config.ts vitest.config.ts playwright.config.ts playwright.analytics.config.js \
  tsconfig.json tsconfig.app.json tsconfig.node.json \
  wrangler.toml components.json .env.example CLOUDFLARE-SETUP.md \
  apps/moonfest2026/
```

- [ ] **Step 3: Move the untracked env + e2e (gitignored — plain mv)**

```bash
[ -f .env.local ] && mv .env.local apps/moonfest2026/.env.local
[ -d e2e ] && mv e2e apps/moonfest2026/e2e
```

- [ ] **Step 4: Create the app package.json**

Create `apps/moonfest2026/package.json`:

```json
{
  "name": "moonfest2026",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "node scripts/build.mjs",
    "build:static": "node scripts/build-static.mjs",
    "release": "node scripts/release.mjs",
    "release:staging": "node scripts/release.mjs --env=staging",
    "deploy:cloudflare": "node scripts/build.mjs && node scripts/deploy-cloudflare.mjs",
    "deploy:cloudflare:dry-run": "pnpm build && node scripts/deploy-cloudflare.mjs --dry-run",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "test": "vitest run --passWithNoTests",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:routing": "playwright test e2e/browser-routing.spec.ts",
    "test:e2e:staging": "node scripts/run-playwright-staging.mjs",
    "test:e2e:analytics": "playwright test --config playwright.analytics.config.js",
    "test:e2e:ui": "playwright test --ui",
    "fetch:telegram": "node scripts/fetch-telegram.mjs",
    "translate:telegram": "node scripts/translate-telegram.mjs",
    "sync:telegram": "node scripts/sync-telegram.mjs",
    "version:auto": "node scripts/bump-version.mjs"
  },
  "dependencies": {
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "i18next": "^25.8.18",
    "i18next-browser-languagedetector": "^8.2.1",
    "lucide-react": "^0.577.0",
    "radix-ui": "^1.4.3",
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "react-i18next": "^16.5.8",
    "react-router": "^7.13.1",
    "react-router-dom": "^7.13.1",
    "tailwind-merge": "^3.5.0"
  },
  "devDependencies": {
    "@axe-core/playwright": "^4.11.1",
    "@playwright/test": "^1.58.2",
    "@rollup/rollup-linux-x64-gnu": "^4.60.3",
    "@tailwindcss/vite": "^4.2.1",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.2",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-legacy": "^7.2.1",
    "@vitejs/plugin-react": "^5.1.4",
    "jsdom": "^28.1.0",
    "shadcn": "^4.0.5",
    "sharp": "^0.34.5",
    "tailwindcss": "^4.2.1",
    "tw-animate-css": "^1.4.0",
    "typescript": "^5.9.3",
    "vite": "^7.3.1",
    "vitest": "^4.0.18",
    "wrangler": "^4.75.0"
  }
}
```

- [ ] **Step 5: Rewrite the root package.json**

Replace the entire root `package.json` with the workspace root:

```json
{
  "name": "furrycolombia-events",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "packageManager": "pnpm@10.28.0",
  "engines": {
    "node": ">=20",
    "pnpm": ">=10"
  },
  "scripts": {
    "dev": "pnpm --filter moonfest2026 dev",
    "build": "pnpm --filter moonfest2026 build",
    "build:static": "pnpm --filter moonfest2026 build:static",
    "typecheck": "pnpm --filter moonfest2026 typecheck",
    "test": "pnpm --filter moonfest2026 test",
    "deploy:cloudflare": "pnpm --filter moonfest2026 deploy:cloudflare",
    "sync:telegram": "pnpm --filter moonfest2026 sync:telegram",
    "version:auto": "pnpm --filter moonfest2026 version:auto",
    "lint": "eslint .",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "fix:staged": "lint-staged --concurrent false",
    "fix:all": "pnpm format && pnpm lint --fix",
    "check:style": "stylelint \"apps/*/src/**/*.css\" && node apps/moonfest2026/scripts/check-css-sync.mjs",
    "check:tools": "pnpm cspell \"apps/*/src/**/*.{ts,tsx,js,jsx,md}\" && pnpm knip && pnpm jscpd apps/moonfest2026/src && pnpm ls-lint",
    "precommit": "lint-staged || (pnpm fix:all && lint-staged)",
    "prepare": "husky"
  },
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "@ls-lint/ls-lint": "^2.3.1",
    "@secretlint/core": "^11.3.1",
    "@secretlint/secretlint-rule-preset-recommend": "^11.3.1",
    "cspell": "^9.7.0",
    "eslint": "^10.0.3",
    "eslint-plugin-compat": "^7.0.1",
    "eslint-plugin-import-x": "^4.16.1",
    "eslint-plugin-jsdoc": "^62.7.1",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.5.2",
    "eslint-plugin-sonarjs": "^4.0.2",
    "eslint-plugin-unicorn": "^63.0.0",
    "eslint-plugin-unused-imports": "^4.4.1",
    "globals": "^17.4.0",
    "husky": "^9.1.7",
    "jscpd": "^4.0.8",
    "knip": "^5.86.0",
    "lighthouse": "^13.0.3",
    "lint-staged": "^16.3.3",
    "prettier": "^3.8.1",
    "stylelint": "^17.4.0",
    "stylelint-config-standard": "^40.0.0",
    "stylelint-no-unsupported-browser-features": "^8.1.1",
    "typescript": "^5.9.3",
    "typescript-eslint": "^8.57.0"
  },
  "lint-staged": {
    "*.{ts,tsx,js,jsx,mjs}": [
      "prettier --check",
      "eslint --no-warn-ignored --max-warnings 0"
    ],
    "*.{json,md,css,html,yml,yaml}": ["prettier --check"]
  }
}
```

- [ ] **Step 6: Fix the app's node tsconfig include**

`apps/moonfest2026/tsconfig.node.json` currently `include`s `eslint.config.mjs` and `stylelint.config.mjs`, which stay at the repo root and no longer sit beside this tsconfig. Set its `include` to only the app-local config files:

```json
  "include": ["vite.config.ts", "vitest.config.ts", "playwright.config.ts"]
```

- [ ] **Step 7: Update the root eslint ignore paths**

In `eslint.config.mjs`, the top `ignores` array uses old root-relative paths. Replace these five entries (leave `node_modules/**`, `coverage/**`, `playwright-report/**`, `test-results/**`, `.claude/**`, `.lh-profile/**`, and the config-file entries unchanged):

- `"dist/**"` → `"apps/*/dist/**"`
- `"dist-static/**"` → `"apps/*/dist-static/**"`
- `"e2e/**"` → `"apps/*/e2e/**"`
- `"scripts/**"` → `"apps/*/scripts/**"`
- `"cloudflare/**"` → `"apps/*/cloudflare/**"`

- [ ] **Step 8: Re-point the husky pre-commit hook**

Replace `.husky/pre-commit` contents with (the version bump now delegates to the app, whose `bump-version.mjs` writes the app's `.env.example` when run with the app as cwd):

```sh
pnpm --filter moonfest2026 version:auto
git add apps/moonfest2026/.env.example
pnpm precommit
```

- [ ] **Step 9: Widen the gitignore paths that were root-anchored**

In `.gitignore`, replace:

```
scripts/telegram.session
scripts/telegram.session-journal
/scripts/__pycache__
scripts/.venv-telegram/
```

with:

```
**/telegram.session
**/telegram.session-journal
**/__pycache__/
**/.venv-telegram/
```

(`dist/`, `dist-static/`, `.env.local`, `.env.*.local`, `coverage/` are not anchored — leave them.)

- [ ] **Step 10: Re-point the telegram launcher shims**

`sync-telegram.cmd`:

```bat
@echo off
setlocal
node "%~dp0apps\moonfest2026\scripts\sync-telegram.mjs" %*
```

`sync-telegram.ps1`:

```powershell
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
& node (Join-Path $scriptDir "apps/moonfest2026/scripts/sync-telegram.mjs") @args
exit $LASTEXITCODE
```

- [ ] **Step 11: Validate JSON and install the workspace**

```bash
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8'));JSON.parse(require('fs').readFileSync('apps/moonfest2026/package.json','utf8'));console.log('json ok')"
pnpm install
```

Expected: `json ok`, then `pnpm install` completes and recognizes workspace packages `moonfest2026` + root. If install errors, resolve before committing.

- [ ] **Step 12: Verify the move looks right**

Run: `ls apps/moonfest2026 && git status --short | head -40`
Expected: moved files under `apps/moonfest2026/`; `git status` shows renames (`R`) for tracked files plus new `pnpm-workspace.yaml`, modified root `package.json`, `eslint.config.mjs`, `.husky/pre-commit`, `.gitignore`, `sync-telegram.*`, and new `apps/moonfest2026/package.json`. Root no longer has `src/`, `vite.config.ts`, `wrangler.toml`.

- [ ] **Step 13: Commit (the hook must pass cleanly)**

```bash
git add -- pnpm-workspace.yaml package.json apps/moonfest2026 \
  eslint.config.mjs .husky/pre-commit .gitignore sync-telegram.cmd sync-telegram.ps1 pnpm-lock.yaml
git commit -m "$(cat <<'EOF'
refactor: relocate moonfest into apps/moonfest2026 under pnpm workspace

Moves all moonfest app files under apps/moonfest2026 (git mv preserves
history), splits package.json into workspace root + app, and re-points
tooling paths (eslint ignores, node tsconfig include, husky version-bump
target, gitignore depth, telegram launcher shims). Single commit so the
pre-commit hook stays toolchain-consistent.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

Expected: the pre-commit hook runs `pnpm --filter moonfest2026 version:auto` (bumps `apps/moonfest2026/.env.example`), stages it, and lint-staged (prettier + eslint) passes on the staged files. If the hook fails:

- **`version:auto` "no projects matched"** → confirm `pnpm-workspace.yaml` exists and `apps/moonfest2026/package.json` has `"name": "moonfest2026"`; re-run `pnpm install`.
- **eslint config-resolution error on moved `apps/moonfest2026/src/**`** → confirm `eslint.config.mjs`still uses`projectService: true`and that`apps/moonfest2026/tsconfig.json` resolves (`@/_`→`./src/_`). Fix the config, do not `--no-verify`.
- **prettier `--check` on a moved file** → the file content is unchanged and was clean; if flagged, `npx prettier --write <file>`, `git add` it, retry.

Report DONE only when the commit succeeds with the hook active.

---

## Task 3: Install verification — reach a green core gate

Drive the four core gate commands to green on the committed workspace. Path re-rooting inside Vite/Vitest/tsconfig is automatic (`import.meta.dirname` / relative `paths`), so breakage here is most likely a **missing devDependency in the wrong package.json** or a **stray old path**. Fix, re-run, and commit any fixes.

**Files:**

- Modify (only if a gate fails): `apps/moonfest2026/package.json` or `package.json`

- [ ] **Step 1: Typecheck the app**

Run: `pnpm --filter moonfest2026 typecheck`
Expected: PASS. If it errors on `eslint.config.mjs`/`stylelint.config.mjs` not found, re-check Task 2 Step 6 (the node tsconfig `include`).

- [ ] **Step 2: Lint from root**

Run: `pnpm lint`
Expected: PASS, zero errors/warnings. If ESLint can't find config for app files, confirm `eslint.config.mjs` is at root with `projectService` resolving `apps/moonfest2026/tsconfig.json`. If it lints build output, re-check the Task 2 Step 7 ignore paths.

- [ ] **Step 3: Unit tests**

Run: `pnpm --filter moonfest2026 test`
Expected: PASS (or "no tests" via `--passWithNoTests`).

- [ ] **Step 4: Production build**

Run: `pnpm --filter moonfest2026 build`
Expected: PASS; emits `apps/moonfest2026/dist/`.

- [ ] **Step 5: Commit any fixes**

Only if Steps 1–4 required edits:

```bash
git add -- package.json apps/moonfest2026/package.json pnpm-lock.yaml
git commit -m "$(cat <<'EOF'
fix: resolve dependency/path fallout from workspace split

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

If no edits were needed, report DONE with a note that the gate passed with no changes (no commit).

---

## Task 4: Verify static build, deploy dry-run, and the commit hook

The remaining gate items: single-file static build, the Cloudflare dry-run (proves deploy works **without** touching production), and the husky hook end-to-end.

- [ ] **Step 1: Static single-file build**

Run: `pnpm --filter moonfest2026 build:static`
Expected: PASS; emits `apps/moonfest2026/dist-static/index.html`. (The `P:\Public Folder` network copy is skipped when the drive is absent — that log line is fine.)

- [ ] **Step 2: Confirm the static output is self-contained**

Run: `node -e "const h=require('fs').readFileSync('apps/moonfest2026/dist-static/index.html','utf8');console.log('external js src present:', /<script[^>]+src=\"[^\"]+\.js/.test(h))"`
Expected: `external js src present: false` (everything inlined).

- [ ] **Step 3: Cloudflare deploy dry-run (NO production change)**

Run: `pnpm --filter moonfest2026 exec wrangler deploy --dry-run`
Expected: PASS; wrangler resolves `apps/moonfest2026/wrangler.toml`, reports the bundled Worker + assets from `./dist`, exits without deploying. If it can't find `wrangler.toml`, pass `--config apps/moonfest2026/wrangler.toml`.

- [ ] **Step 4: Exercise the husky pre-commit hook**

```bash
printf '\n' >> apps/moonfest2026/HOOK-CHECK.md
git add apps/moonfest2026/HOOK-CHECK.md
git commit -m "test: verify pre-commit hook under workspace

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

Expected: hook runs `pnpm --filter moonfest2026 version:auto` (bumps `apps/moonfest2026/.env.example`), stages it, runs lint-staged, commit succeeds.

- [ ] **Step 5: Remove the hook-check file**

```bash
git rm apps/moonfest2026/HOOK-CHECK.md
git commit -m "test: remove pre-commit hook check file

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: Best-effort tooling repair, final gate, and PR

`check:tools`/`check:style` were already partly broken pre-migration (stale `apps/store…` paths, uninstalled tools). Repair the fixable parts; do not block the phase on them.

- [ ] **Step 1: Run the repaired check scripts (best-effort)**

Run: `pnpm check:style` then `pnpm check:tools`
Expected: `check:style` passes or reports real CSS issues. `check:tools` may surface knip/cspell findings — record them, do not gate. If either throws on a missing tool, note it as a follow-up (out of this phase's gate).

- [ ] **Step 2: Run the full acceptance gate in sequence**

```bash
pnpm --filter moonfest2026 typecheck
pnpm lint
pnpm --filter moonfest2026 test
pnpm --filter moonfest2026 build
pnpm --filter moonfest2026 build:static
pnpm --filter moonfest2026 exec wrangler deploy --dry-run
```

Expected: all green (spec §2 acceptance gate).

- [ ] **Step 3: Confirm the live site was never touched**

Run: `git log --oneline main..HEAD`
Expected: only migration commits — no non-dry-run `wrangler deploy` was run. Production Worker unchanged.

- [ ] **Step 4: Push the branch and open a PR (no deploy)**

```bash
git push -u origin chore/monorepo-migration-phase-1a
gh pr create --title "chore: pnpm workspace migration (phase 1a — moonfest to apps/moonfest2026)" --body "$(cat <<'EOF'
Relocates the moonfest site into a self-contained `apps/moonfest2026/` under a pnpm workspace. Pure structural move — no source logic changes, no production deploy.

Acceptance gate (all green): typecheck, lint, test, build, build:static, wrangler --dry-run, husky pre-commit hook.

Live site untouched: no non-dry-run `wrangler deploy` was run. Deploying the relocated app to production is a separate, human-approved step.

Spec: docs/superpowers/specs/2026-07-06-moonfest-monorepo-migration-design.md
Plan: docs/superpowers/plans/2026-07-06-workspace-migration-phase-1a.md

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 5: Report the deploy decision to the user**

Do NOT deploy. Report that the gate is green and ask whether/when to run the first production deploy of the relocated app (`pnpm --filter moonfest2026 deploy:cloudflare`) to confirm parity — the user's call.

---

## Self-Review Notes

- **Spec coverage:** §2 acceptance criteria → Tasks 3–5 gate. §3 layout → Task 2. §4 path table → Task 2 Steps 6–10. §5 workspace/scripts → Task 2 Steps 4–5. §6 secrets → deferred to Phase 1b (Global Constraints). §7 steps → Tasks 1–5. §8 risks/rollback → branch-based, dry-run only. §9 sequencing → this is 1a; telegram-sync extraction is Phase 1b (own plan).
- **Ordering correctness:** the pre-commit hook exercises the full toolchain, so the relocation + package.json split + path/husky fixes are one atomic commit (Task 2). No intermediate broken state is ever committed.
- **Not in this plan (Phase 1b):** extracting `packages/telegram-sync/`, `telegram.config.json`, ID/keyword selection, append-only archive, and hoisting shared secrets to root `.env.local`. In 1a the telegram scripts move intact and keep running from the app.
