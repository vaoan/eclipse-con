# Moonfest → pnpm Workspace Migration — Design

- **Date:** 2026-07-06
- **Status:** Approved (design), pending implementation plan
- **Author:** Heiner Angarita + Claude
- **Related:** [`2026-07-06-sunfest-teaser-site-design.md`](./2026-07-06-sunfest-teaser-site-design.md) (phase two)

## 1. Summary

Convert this single-app repo into a **pnpm workspace** and move moonfest2026 into a
fully self-contained app at **`apps/moonfest2026/`**. This is phase one; adding the sunfest2027
teaser at `apps/sunfest2027/` (its own spec) becomes trivial once the workspace exists.

The migration is a **repo restructuring only**. It does not change what the live site serves and
does not deploy anything. The live site keeps running the already-deployed Worker until we
explicitly choose to redeploy after verification.

## 2. Acceptance Criteria (the user's two conditions)

1. **The live site is never damaged.** `moonfest.furrycolombia.com` is served by the currently
   deployed Cloudflare Worker. File moves in the repo do not touch it; only `wrangler deploy` does.
   We do **not** redeploy moonfest until every check below is green and the user approves.
2. **Every pnpm action works after migration.** The migration is "done" only when all of these pass
   from a clean `pnpm install`:
   - `pnpm --filter moonfest2026 typecheck`
   - `pnpm --filter moonfest2026 lint`
   - `pnpm --filter moonfest2026 test`
   - `pnpm --filter moonfest2026 build` (produces the same working `dist/`)
   - `pnpm --filter moonfest2026 build:static` (produces the single-file `dist-static/index.html`)
   - the husky `pre-commit` hook (lint-staged + `version:auto`) runs correctly on a staged change
   - `wrangler deploy --config apps/moonfest2026/wrangler.toml --dry-run` succeeds
   - `pnpm test:e2e` routing/analytics specs pass (or are knowingly deferred)

Everything is reversible via git until the first real redeploy.

## 3. Target Layout

```
repo/
  pnpm-workspace.yaml            # NEW: packages: [apps/*]
  package.json                   # SLIMMED: workspace root — shared devDeps, husky, delegating scripts
  .husky/pre-commit              # stays at root (workspace-wide)
  .env.local                     # SLIMMED: shared deploy credentials only (CLOUDFLARE_API_TOKEN)
  eslint.config.mjs              # root base (apps extend/consume)
  .prettierrc, .prettierignore   # root (workspace-wide formatting)
  docs/                          # root

  apps/
    moonfest2026/                # MOVED: everything moonfest, self-contained
      index.html
      public/
      src/                       # unchanged internals; @/* → ./src/*
      cloudflare/worker.mjs
      scripts/                   # moonfest-specific: build, build-static, deploy-cloudflare,
                                 #   release, sync/fetch/translate-telegram, bump-version, etc.
      vite.config.ts             # uses import.meta.dirname → re-roots automatically
      wrangler.toml              # [assets] directory = "./dist", main = "cloudflare/worker.mjs"
      tsconfig*.json             # @/* path alias intact
      vitest.config.ts
      playwright.config.ts
      package.json               # moonfest's build/dev/deploy/test scripts + runtime deps
      .env.example               # moonfest safe defaults (VITE_*, telegram, translation)
      .env.local                 # moonfest runtime/content secrets (gitignored)

    sunfest2027/                 # phase two (separate spec)
```

**What stays at root:** `pnpm-workspace.yaml`, a slimmed workspace `package.json` (shared devDeps +
husky + delegating scripts), husky hooks, prettier/eslint base config, `.gitignore`, `docs/`, and
shared deploy credentials in root `.env.local`.

**What moves into `apps/moonfest2026/`:** all moonfest source, its build/test/deploy tooling, its
Vite/wrangler/tsconfig/vitest/playwright configs, its worker, its `public/`, and its own env files.

## 4. Key Path / Config Updates

Moving the app re-roots most things automatically, but these need explicit attention:

| Concern                       | Change                                                                                       |
| ----------------------------- | -------------------------------------------------------------------------------------------- | ------ | ----------------------------------------- |
| `@/*` alias                   | tsconfig `paths` + Vite alias already relative (`./src/*`, `import.meta.dirname`) → intact   |
| `index.html` script src       | `/src/main.tsx` resolves against the app's Vite root → intact after move                     |
| Vite config internals         | Uses `import.meta.dirname` for `.env.example`, out dirs, inliner → re-roots with the file    |
| `wrangler.toml` paths         | `directory = "./dist"`, `main = "cloudflare/worker.mjs"` stay relative to the app dir        |
| `scripts/*.mjs` cwd           | Run with the app as cwd (via `pnpm --filter`); audit `process.cwd()`/root-relative paths     |
| `build-static.mjs`            | Reads `.env.example`, writes `dist-static`, copies to `P:\Public Folder` → keep app-relative |
| husky + lint-staged           | Stay at root; lint-staged globs updated to cover `apps/**`                                   |
| `version:auto` bump           | Writes `VITE_APP_VERSION` into moonfest's `.env.example` (now under the app)                 |
| vitest / playwright           | Configs move into the app; root can still invoke via `--filter`                              |
| `check:tools` / `check:style` | Rewrite the stale `apps/store                                                                | studio | ...`references to the real`apps/\*` names |

## 5. Workspace & Scripts

- **`pnpm-workspace.yaml`:** `packages: ["apps/*"]`.
- **Per-app `package.json`** (`apps/moonfest2026/`): owns `dev`, `build`, `build:static`, `preview`,
  `typecheck`, `lint`, `test`, `test:e2e`, `deploy:cloudflare`, telegram sync scripts, and moonfest's
  runtime dependencies (react, i18next, etc.).
- **Root `package.json`:** shared devDependencies (prettier, eslint, husky, lint-staged, typescript,
  wrangler), the `prepare`/`precommit` husky wiring, and thin delegating scripts, e.g.
  `"build": "pnpm --filter moonfest2026 build"`, so existing muscle memory (`pnpm build`) still works
  during the transition.
- **Package name:** `moonfest2026` (used by `--filter`).

## 6. Secrets & Environment

Three buckets (confirmed against current `.env.local`):

1. **Shared deploy credential — root `.env.local` (gitignored):** `CLOUDFLARE_API_TOKEN` (deploys any
   worker in the account, not app-specific), and `CLOUDFLARE_FFXIVBE_ZERO_TRUST_API_TOKEN` if still
   used. Deploy scripts resolve the token from repo root regardless of which app they build.
2. **moonfest content/runtime secrets — `apps/moonfest2026/.env.local` (gitignored):** all
   `TELEGRAM_*`, translation (`ANTHROPIC_API_KEY`, `OPENAI_*`, `TRANSLATE_PROVIDER`), and `VITE_*`
   analytics keys. Vite auto-loads env from the app root, so these live with moonfest.
3. **sunfest — its own (phase two):** a static teaser needs essentially none; its `.env.example` is
   near-empty. Any future analytics/channel secrets are _its own_, isolated from moonfest.

**Principle:** separate _how we deploy_ (one shared Cloudflare token at root) from _what an app
contains_ (per-app env files). No new credentials are created now — for today the values are the same
single set; we are only organizing where they live. Both `.env.example` files are committed (safe
defaults); both `.env.local` files stay gitignored. Update `.gitignore` to ignore `apps/*/.env.local`.

## 7. Migration Steps (high level — detailed in the plan)

1. Create branch (do not work on `main`).
2. Add `pnpm-workspace.yaml`; create `apps/moonfest2026/`.
3. `git mv` moonfest files into the app (preserve history): `src/`, `index.html`, `public/`,
   `cloudflare/`, `scripts/`, `vite.config.ts`, `wrangler.toml`, `tsconfig*`, `vitest.config.ts`,
   `playwright.config.ts`, `e2e/`.
4. Split `package.json` into root (workspace) + `apps/moonfest2026/package.json`.
5. Split env files per §6; update `.gitignore`.
6. Update lint-staged globs, husky wiring, and the `check:*` script paths.
7. `pnpm install` at root; fix any path breakage.
8. Run the full §2 verification gate until green.
9. Only after green **and** user approval: optionally redeploy moonfest to confirm parity in
   production (or leave the live Worker as-is — no redeploy required by this migration).

## 8. Risks & Rollback

- **Risk:** a root-relative path in a `scripts/*.mjs` breaks under the new cwd. **Mitigation:** audit
  each script in step 7; the verification gate catches it before any deploy.
- **Risk:** husky/lint-staged misfires across the workspace. **Mitigation:** test the pre-commit hook
  explicitly in the gate.
- **Risk:** the static single-file build (custom inliner) mis-resolves asset paths after the move.
  **Mitigation:** `build:static` is an explicit gate item; diff the output `index.html`.
- **Rollback:** the entire migration lives on a branch and is a pure file/config reorganization —
  `git reset`/branch-abandon restores the exact current state. The live site is untouched throughout.

## 9. Sequencing

1. **This spec (phase one):** migrate moonfest → workspace, verify, land on `main`.
2. **Sunfest teaser spec (phase two):** add `apps/sunfest2027/` as a second workspace app. With the
   workspace in place, it is a clean additive app — no moonfest changes.

## 10. Out of Scope

- No `packages/*` shared-code extraction yet (only one runtime app until sunfest lands; extract at the
  third real reuse — Rule of Three).
- No redeploy of moonfest is required by this migration; production parity check is optional and
  user-gated.
- No CI pipeline changes beyond making the existing scripts work under the workspace.
