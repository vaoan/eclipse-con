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
- Secrets are NOT reorganized in this phase: `.env.local` / `.env.example` move into the app **as-is**. The shared-root-secrets split (spec §6) is deferred to Phase 1b (telegram-sync), which is the first phase that actually needs a second consumer.
- Acceptance gate (must all pass before phase is "done"): `pnpm --filter moonfest2026 typecheck`, root `pnpm lint`, `pnpm --filter moonfest2026 test`, `pnpm --filter moonfest2026 build`, `pnpm --filter moonfest2026 build:static`, `wrangler deploy --dry-run` with the app config, and the husky `pre-commit` hook on a real staged change. `check:tools`/`check:style` and `test:e2e` are best-effort, not gating (both were already partially broken / gitignored pre-migration).

---

## Task 1: Land pending Telegram work and branch

Clean the working tree first so the `git mv` in Task 2 operates on committed files (renames stay legible in history). The tree currently holds the finished, verified WSL self-heal tooling plus a synced news batch.

**Files:**

- Commit (tooling): `scripts/_telegram_bootstrap.py`, `scripts/resolve-python.mjs`, `scripts/fetch-telegram.mjs`, `scripts/fetch-telegram.py`, `scripts/translate-telegram.mjs`, `scripts/translate-telegram.py`, `.gitignore`
- Commit (content): `public/telegram/messages.json`, `public/telegram/messages.en.json`, `public/telegram/media/msg_6194.jpg`, `public/telegram/media/msg_6653.jpg`, `public/telegram/media/msg_6654.jpg`, `public/telegram/media/msg_7659.xlsx`, `public/telegram/media/msg_8196.xlsx`, `public/BreB.jpg`, `README.md`

- [ ] **Step 1: Confirm the current tree state**

Run: `git status --short`
Expected: the modified/untracked files listed above, on branch `main`.

- [ ] **Step 2: Commit the telegram tooling (WSL self-heal)**

```bash
git add scripts/_telegram_bootstrap.py scripts/resolve-python.mjs \
  scripts/fetch-telegram.mjs scripts/fetch-telegram.py \
  scripts/translate-telegram.mjs scripts/translate-telegram.py .gitignore
git commit -m "$(cat <<'EOF'
feat: self-provisioning telegram sync (WSL/venv bootstrap)

Interpreter resolver + Python bootstrap so telegram sync installs its
own dependencies unattended from WSL-root or Windows.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

Note: the husky hook will bump `.env.example` and re-run lint-staged; that is expected. If it fails on formatting, run `npx prettier --write <file>` on the flagged file and re-commit.

- [ ] **Step 3: Commit the synced news content**

```bash
git add public/telegram/messages.json public/telegram/messages.en.json \
  public/telegram/media/msg_6194.jpg public/telegram/media/msg_6653.jpg \
  public/telegram/media/msg_6654.jpg public/telegram/media/msg_7659.xlsx \
  public/telegram/media/msg_8196.xlsx public/BreB.jpg README.md
git commit -m "$(cat <<'EOF'
chore: sync telegram news batch and media

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 4: Create the migration branch**

```bash
git checkout -b chore/monorepo-migration-phase-1a
```

- [ ] **Step 5: Verify clean tree on the branch**

Run: `git status --short && git branch --show-current`
Expected: no output from status (clean tree); branch is `chore/monorepo-migration-phase-1a`.

---

## Task 2: Add the workspace root and relocate the app

**Files:**

- Create: `pnpm-workspace.yaml`
- Move (git-tracked, via `git mv`): `src`, `public`, `index.html`, `cloudflare`, `scripts`, `vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`, `playwright.analytics.config.js`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `wrangler.toml`, `components.json`, `.env.example`, `CLOUDFLARE-SETUP.md` → under `apps/moonfest2026/`
- Move (untracked/gitignored, via plain `mv`): `.env.local`, `e2e` → under `apps/moonfest2026/`

- [ ] **Step 1: Create the workspace manifest**

Create `pnpm-workspace.yaml`:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

- [ ] **Step 2: Create the app directory**

```bash
mkdir -p apps/moonfest2026
```

- [ ] **Step 3: Move the git-tracked app files**

```bash
git mv src public index.html cloudflare scripts \
  vite.config.ts vitest.config.ts playwright.config.ts playwright.analytics.config.js \
  tsconfig.json tsconfig.app.json tsconfig.node.json \
  wrangler.toml components.json .env.example CLOUDFLARE-SETUP.md \
  apps/moonfest2026/
```

- [ ] **Step 4: Move the untracked env + e2e (gitignored — plain mv)**

```bash
[ -f .env.local ] && mv .env.local apps/moonfest2026/.env.local
[ -d e2e ] && mv e2e apps/moonfest2026/e2e
```

- [ ] **Step 5: Verify the move**

Run: `ls apps/moonfest2026 && git status --short`
Expected: the moved files appear under `apps/moonfest2026/`; `git status` shows renames (`R`) for tracked files and the new `pnpm-workspace.yaml`. Root no longer contains `src/`, `vite.config.ts`, `wrangler.toml`, etc.

- [ ] **Step 6: Commit the relocation**

```bash
git add pnpm-workspace.yaml apps/moonfest2026
git commit -m "$(cat <<'EOF'
refactor: relocate moonfest app into apps/moonfest2026 under pnpm workspace

Pure file move (git mv preserves history). Package.json split and path
fixes follow in subsequent commits.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Split package.json (root workspace + app)

**Files:**

- Create: `apps/moonfest2026/package.json`
- Modify: `package.json` (root — rewrite to workspace root)

**Interfaces:**

- Produces: app package name `moonfest2026` with scripts `dev`, `build`, `build:static`, `typecheck`, `test`, `test:e2e`, `deploy:cloudflare`, `sync:telegram`, `version:auto`. Root delegating scripts call `pnpm --filter moonfest2026 <script>`.

- [ ] **Step 1: Create the app package.json**

Create `apps/moonfest2026/package.json` (runtime deps + build/test toolchain live here; the app owns its own build/test/deploy scripts):

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

- [ ] **Step 2: Rewrite the root package.json**

Replace the entire root `package.json` with the workspace root (repo-wide tooling + delegating scripts). `lint`/`format`/`check:*` run from root over `apps/*`; the husky hook lives here:

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

- [ ] **Step 3: Verify JSON validity**

Run: `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8'));JSON.parse(require('fs').readFileSync('apps/moonfest2026/package.json','utf8'));console.log('both valid')"`
Expected: `both valid`

- [ ] **Step 4: Commit**

```bash
git add package.json apps/moonfest2026/package.json
git commit -m "$(cat <<'EOF'
refactor: split package.json into workspace root and moonfest2026 app

Root owns repo-wide tooling (eslint/prettier/stylelint/husky) and
delegates dev/build/test to the app via pnpm --filter.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Re-point paths that don't move with the app

Four things reference locations that changed: the app's node tsconfig includes two root-only config files; the root eslint ignore list points at old paths; the husky hook bumps and stages the app's `.env.example`; `.gitignore` and the telegram launcher shims point at the old `scripts/` location.

**Files:**

- Modify: `apps/moonfest2026/tsconfig.node.json`
- Modify: `eslint.config.mjs`
- Modify: `.husky/pre-commit`
- Modify: `.gitignore`
- Modify: `sync-telegram.cmd`, `sync-telegram.ps1`

- [ ] **Step 1: Drop root-only config files from the app's node tsconfig**

In `apps/moonfest2026/tsconfig.node.json`, the `include` array lists `eslint.config.mjs` and `stylelint.config.mjs`, which stay at the repo root and no longer exist beside this tsconfig. Change the `include` array to only the app-local config files:

```json
  "include": ["vite.config.ts", "vitest.config.ts", "playwright.config.ts"]
```

- [ ] **Step 2: Update the root eslint ignore paths**

In `eslint.config.mjs`, the top `ignores` array uses old root-relative paths. Replace the app-relative entries so they match the new location (leave `node_modules/**`, `coverage/**`, `playwright-report/**`, `test-results/**`, `.claude/**`, `.lh-profile/**`, and the config-file entries unchanged):

```js
      "apps/*/dist/**",
      "apps/*/dist-static/**",
      "apps/*/e2e/**",
      "apps/*/scripts/**",
      "apps/*/cloudflare/**",
```

(Replace the former `"dist/**"`, `"dist-static/**"`, `"e2e/**"`, `"scripts/**"`, `"cloudflare/**"` entries respectively.)

- [ ] **Step 3: Re-point the husky pre-commit hook**

The version bump now belongs to the app (its `bump-version.mjs` writes the app's `.env.example` when run with the app as cwd). Replace `.husky/pre-commit` contents with:

```sh
pnpm --filter moonfest2026 version:auto
git add apps/moonfest2026/.env.example
pnpm precommit
```

- [ ] **Step 4: Widen the gitignore paths that were root-anchored**

In `.gitignore`, replace the five moonfest-scripts entries so they match the file at its new depth. Change:

```
scripts/telegram.session
scripts/telegram.session-journal
/scripts/__pycache__
scripts/.venv-telegram/
```

to:

```
**/telegram.session
**/telegram.session-journal
**/__pycache__/
**/.venv-telegram/
```

(`dist/`, `dist-static/`, `.env.local`, `.env.*.local`, `coverage/` are not anchored and already match at any depth — leave them.)

- [ ] **Step 5: Re-point the telegram launcher shims**

`sync-telegram.cmd` and `sync-telegram.ps1` at the repo root call `scripts/sync-telegram.mjs`, which is now under the app. Update each path:

In `sync-telegram.cmd`:

```bat
@echo off
setlocal
node "%~dp0apps\moonfest2026\scripts\sync-telegram.mjs" %*
```

In `sync-telegram.ps1`:

```powershell
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
& node (Join-Path $scriptDir "apps/moonfest2026/scripts/sync-telegram.mjs") @args
exit $LASTEXITCODE
```

- [ ] **Step 6: Commit**

```bash
git add apps/moonfest2026/tsconfig.node.json eslint.config.mjs .husky/pre-commit .gitignore sync-telegram.cmd sync-telegram.ps1
git commit -m "$(cat <<'EOF'
fix: re-point tooling paths for the app relocation

Node tsconfig include, eslint ignores, husky version-bump target,
gitignore depth, and telegram launcher shims now reference
apps/moonfest2026.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Install and reach a green core gate

Install the workspace, then drive the four core gate commands to green. Path re-rooting inside Vite/Vitest/tsconfig is automatic (they use `import.meta.dirname` / relative `paths`), so breakage here is most likely a **missing devDependency in the wrong package.json** or a **stray old path**. Fix and re-run.

**Files:**

- Modify (as needed): `apps/moonfest2026/package.json` or `package.json` (only if a missing dependency surfaces)

- [ ] **Step 1: Install the workspace**

Run: `pnpm install`
Expected: completes; creates a single updated `pnpm-lock.yaml`; recognizes workspace packages `moonfest2026` and the root. If it reports an unmet peer or missing bin, note which package needs the dep.

- [ ] **Step 2: Typecheck the app**

Run: `pnpm --filter moonfest2026 typecheck`
Expected: PASS (no TS errors). If it errors on `eslint.config.mjs`/`stylelint.config.mjs` not found, re-check Task 4 Step 1 (the node tsconfig `include`).

- [ ] **Step 3: Lint from root**

Run: `pnpm lint`
Expected: PASS with zero errors/warnings. If ESLint reports "could not find config" for app files, confirm `eslint.config.mjs` is still at root and its `projectService` resolves `apps/moonfest2026/tsconfig.json`. If it lints build output, re-check the Task 4 Step 2 ignore paths.

- [ ] **Step 4: Run unit tests**

Run: `pnpm --filter moonfest2026 test`
Expected: PASS (or "no tests" passes via `--passWithNoTests`). Vitest resolves `@` → `apps/moonfest2026/src` via its `import.meta.dirname` alias.

- [ ] **Step 5: Production build**

Run: `pnpm --filter moonfest2026 build`
Expected: PASS; emits `apps/moonfest2026/dist/`. This runs `scripts/build.mjs` with the app as cwd, so `dist/`, `public/`, and the inliner all resolve under the app.

- [ ] **Step 6: Commit any dependency/path fixes**

Only if Steps 1–5 required edits:

```bash
git add package.json apps/moonfest2026/package.json pnpm-lock.yaml
git commit -m "$(cat <<'EOF'
fix: resolve dependency/path fallout from workspace split

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

If no edits were needed, still stage the refreshed lockfile:

```bash
git add pnpm-lock.yaml && git commit -m "chore: update pnpm-lock for workspace

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: Verify static build, deploy dry-run, and the commit hook

The remaining gate items: the single-file static build, the Cloudflare dry-run (proves the deploy path works **without** touching production), and the husky hook end-to-end.

- [ ] **Step 1: Static single-file build**

Run: `pnpm --filter moonfest2026 build:static`
Expected: PASS; emits `apps/moonfest2026/dist-static/index.html`. (The `P:\Public Folder` network copy is skipped when the drive is absent — that log line is fine.)

- [ ] **Step 2: Confirm the static output is self-contained**

Run: `node -e "const h=require('fs').readFileSync('apps/moonfest2026/dist-static/index.html','utf8');console.log('has script tag src to external js:', /<script[^>]+src=\"[^\"]+\.js/.test(h))"`
Expected: `has script tag src to external js: false` (everything inlined).

- [ ] **Step 3: Cloudflare deploy dry-run (NO production change)**

Run: `pnpm --filter moonfest2026 exec wrangler deploy --dry-run`
Expected: PASS; wrangler resolves `apps/moonfest2026/wrangler.toml`, reports the bundled Worker + assets from `./dist`, and exits without deploying. If it can't find `wrangler.toml`, run from the app dir or pass `--config apps/moonfest2026/wrangler.toml`.

- [ ] **Step 4: Exercise the husky pre-commit hook**

Make a trivial staged change and commit to prove the hook (version bump + lint-staged) works under the workspace:

```bash
printf '\n' >> apps/moonfest2026/README-e2e-hook-check.md
git add apps/moonfest2026/README-e2e-hook-check.md
git commit -m "test: verify pre-commit hook under workspace

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

Expected: the hook runs `pnpm --filter moonfest2026 version:auto` (bumps `apps/moonfest2026/.env.example`), stages it, runs lint-staged, and the commit succeeds.

- [ ] **Step 5: Remove the hook-check file**

```bash
git rm apps/moonfest2026/README-e2e-hook-check.md
git commit -m "test: remove pre-commit hook check file

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 7: Best-effort tooling repair, final gate, and PR

`check:tools`/`check:style` were already partly broken pre-migration (they referenced non-existent `apps/store`… paths and uninstalled tools). Repair the obviously-fixable parts; do not block the phase on them.

**Files:**

- Modify (best-effort): none required beyond the root `package.json` `check:*` scripts already rewritten in Task 3 Step 2.

- [ ] **Step 1: Run the repaired check scripts (best-effort)**

Run: `pnpm check:style` then `pnpm check:tools`
Expected: `check:style` passes or reports real CSS issues. `check:tools` may still surface knip/cspell findings — record them but do not gate on them. If either throws on a missing tool, note it for a follow-up; it is out of this phase's gate.

- [ ] **Step 2: Run the full acceptance gate in sequence**

Run each and confirm PASS:

```bash
pnpm --filter moonfest2026 typecheck
pnpm lint
pnpm --filter moonfest2026 test
pnpm --filter moonfest2026 build
pnpm --filter moonfest2026 build:static
pnpm --filter moonfest2026 exec wrangler deploy --dry-run
```

Expected: all green. This is the spec's acceptance gate (§2).

- [ ] **Step 3: Confirm the live site was never touched**

Run: `git log --oneline main..HEAD`
Expected: only the migration commits from this plan — no `wrangler deploy` (non-dry-run) was ever run. The production Worker is unchanged.

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

Do NOT deploy. Tell the user the gate is green and ask whether/when to run the first production deploy of the relocated app (`pnpm --filter moonfest2026 deploy:cloudflare`) to confirm parity — their call, per the spec.

---

## Self-Review Notes

- **Spec coverage:** §2 acceptance criteria → Tasks 5–7 gate. §3 layout → Tasks 2–4. §4 path table → Task 4. §5 workspace/scripts → Task 3. §6 secrets → deferred to Phase 1b (called out in Global Constraints). §7 steps → Tasks 1–7. §8 risks/rollback → branch-based, dry-run-only. §9 sequencing → this is phase 1a; telegram-sync extraction (packages/telegram-sync) is Phase 1b, its own plan.
- **Not in this plan (Phase 1b):** extracting `packages/telegram-sync/`, `telegram.config.json`, the ID/keyword selection layer, append-only archive semantics, and hoisting shared secrets to root `.env.local`. In 1a the telegram scripts move intact and keep running from the app.
