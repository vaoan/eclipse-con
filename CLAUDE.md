# CLAUDE.md

Guidance for Claude Code in this repository, short on purpose: each line links to the lesson that holds the full text and the reason, and lessons are read when relevant, not on every turn. Layout, per-site architecture, the full command list and the how-to steps: `docs/lessons/project-overview.md`.

## What eclipse-con is

A pnpm workspace holding the Furry Colombia event sites, each a React single-page app built with Vite, TypeScript (strict) and Tailwind CSS v4. **Moonfest 2026 has concluded. Sunfest 2027 is the active product**: every unsuffixed command (`pnpm dev`, `pnpm build`, `pnpm test`) targets it, and new work goes there by default.

- `apps/sunfest2027/` is ACTIVE and flat: `src/{sections,components,lib,locales,assets}`, with hand-written CSS in `src/index.css` on `@theme` tokens. It is a single-file static site with no router, no E2E suite, no env vars and no Telegram sync; do not invent those for it.
- `apps/links/` is the fco.bz redirect Worker (`worker/`, D1 `migrations/`) plus the admin.fco.bz dashboard (`src/`, flat). Links are edited in a Google Sheet, never in code; keep within the Workers Free limits (10 ms CPU, 50 D1 queries per invocation) and never store a raw IP.
- `apps/moonfest2026/` is ARCHIVED and kept buildable: Clean Architecture under `src/{app,features,shared}`. Read-only maintenance; add nothing unasked, and do not port its structure onto Sunfest.
- `packages/telegram-sync/` serves Moonfest only. `cloudflare/` holds the Sunfest asset worker. `docs/superpowers/` holds dated specs and plans (historical).

The apps are deliberately structured differently: match the app you are editing, and never import across apps.

## Invariants

- **Sunfest deploys on every push to `main`** (a merged PR is a push) through `.github/workflows/deploy-sunfest.yml`, unless only `apps/moonfest2026/`, `apps/links/`, `packages/`, `docs/`, `publicity/` or Markdown changed. The other Workers deploy by hand (`pnpm deploy:links`, `pnpm deploy:cloudflare:moonfest`, `pnpm deploy:archive:moonfest`). → `docs/lessons/project-overview.md` (Deployment)
- **Every `git` and `gh` call uses the PAT in `.secrets` (`GH_TOKEN`)**, with commit identity set `--local` from `gh api user`; never `git config --global` or a hardcoded name or email. Procedure: `docs/git-with-gh-token.md`. Never print the token.
- **NEVER force push to `main`** (`--force` or `--force-with-lease`): it destroys shared history. → `docs/lessons/git-safety.md`
- **NEVER use `--no-verify`** on a commit or push: the pre-commit and pre-push hooks enforce quality. → `docs/lessons/git-safety.md`
- **NEVER commit `.env.local`, `.env.*.local`, or any file with keys, tokens, passwords or credentials.** If staged by mistake, unstage at once; if committed, alert the team. The repo is public. → `docs/lessons/git-safety.md`
- **ALWAYS create a new commit; do not amend unless the user explicitly asks**, because amending after a failed pre-commit hook can destroy the previous commit's content. → `docs/lessons/git-safety.md`
- **ALWAYS stage specific files** (`git add <file>`), never `git add -A` or `git add .`, which can sweep in secrets or unintended files. → `docs/lessons/git-safety.md`
- **ALWAYS end AI-generated commits with `Co-Authored-By: Claude <noreply@anthropic.com>`** (the model name may follow `Claude`). → `docs/lessons/git-workflow.md`
- **Commit as Conventional Commits**: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `style`. **Branch as `feature/`, `fix/`, `chore/` or `refactor/` plus a description** (`fix/login-redirect`). One concern per PR, small, with a description of what changed and why. → `docs/lessons/git-workflow.md`

## Before calling work finished

Run `pnpm typecheck && pnpm lint --max-warnings 0 && pnpm build`, all with zero errors and zero warnings (plain `pnpm lint` can pass while the commit hook, which runs `eslint --max-warnings 0`, fails), and `pnpm test`; CI runs typecheck, lint, test, build in that order and a failure blocks the rest. JSDoc warnings count as errors. After a layout change to Sunfest also run `pnpm check:overflow`. Other gates: `pnpm format:check`, `pnpm check:style`, `pnpm check:tools` (cspell, knip, jscpd, ls-lint). The pre-commit hook runs `pnpm precommit` (lint-staged) and does not bump versions. → `docs/lessons/build-checks.md`

## Commands

Unsuffixed commands act on **sunfest2027**; Moonfest ones are suffixed. Everything else, including Links and Moonfest commands and the QR scripts, is in `docs/lessons/project-overview.md` (Quick Reference).

```bash
pnpm dev              # dev server (localhost:5173)
pnpm build            # TypeScript check + production build (single-file HTML)
pnpm build:static     # same build, emitted to dist-static/
pnpm preview          # preview the production build
pnpm typecheck        # type checking only
pnpm test             # unit tests (Vitest)
pnpm lint             # ESLint across the workspace
pnpm format           # Prettier (write); pnpm format:check to only check
pnpm check:overflow   # fail if the built page scrolls sideways at any width
pnpm deploy:sunfest   # build + wrangler deploy --config wrangler.sunfest.toml
pnpm sync:secrets     # pull repo secrets into .secrets
```

## Conventions, as they apply here

- **Components**: function components only, one per file, `readonly` props typed `NameProps`. `tid()` for test ids (stripped in production), `cn()` for class merging. → `docs/lessons/component-patterns.md`, `docs/lessons/one-component-per-file.md`
- **i18n**: every display string uses `t()` from `react-i18next` (keys `feature.section.key`); add each key to both `en.json` and `es.json`. Tests assert keys, not copy. → `docs/lessons/i18n.md`, `docs/lessons/i18n-testing.md`
- **JSDoc**: every exported `function`, `const` arrow/function expression, `type` and `interface` has a `/** ... */` block, and you update the JSDoc of every symbol you touch. `eslint-plugin-jsdoc` enforces it. → `docs/lessons/jsdoc.md`
- **Imports**: `@/*` alias for anything beyond one level up (it resolves to the app's `src/*`), `import type` for types. Never `import.meta.env` outside `environment.ts` (Moonfest only; Sunfest reads no env vars). Variables are `VITE_`-prefixed. → `docs/lessons/portability.md`
- **Naming**: files PascalCase for components and types, camelCase for utils and hooks, kebab-case for configs; hooks `use*`; types PascalCase with no `I` or `T` prefix; constants `UPPER_SNAKE_CASE`; tests `*.test.ts(x)`. → `docs/lessons/naming-conventions.md`
- **pnpm only**: never npm or yarn, and never commit `package-lock.json` or `yarn.lock`. → `docs/lessons/portability.md`
- **SOLID**: one reason to change per module; components render and never fetch; compose through props; depend on ports, not adapters. → `docs/lessons/solid-principles.md`
- **DRY**: share knowledge, not look-alike code; extract at the third occurrence, and put shared types in the domain layer. → `docs/lessons/dry-principle.md`
- **KISS**: readable over clever, no premature optimization, smallest prop surface, local state before lifted state. → `docs/lessons/kiss-principle.md`
- **Single source of truth**: derive instead of storing a second copy; types come from the domain layer; configuration from one `environment.ts`. → `docs/lessons/single-source-of-truth.md`
- **No hardcoding**: no display strings in JSX, no magic numbers (name the constant), no URLs outside config, no raw hex or rgb (use tokens). → `docs/lessons/no-hardcoding.md`
- **Reviewing** (or self-checking before commit): no unjustified `any`; async errors handled and surfaced; keyboard access, `alt`, labels and WCAG AA contrast; i18n in `en` and `es`; tests for new behaviour at 85% coverage; no dead code or over-engineering. → `docs/lessons/code-review-standards.md`

## Where the rules live

**`.claude/rules/`**, loaded only when a matching file is read: `testing`, `i18n-testing`, `i18n`, `e2e-selectors`, `tailwind`, `component-patterns`, `one-component-per-file`, `architecture` (Moonfest only), `analytics-tracking`, `build-checks`. Each rule starts with `paths:` on line 1.

**`.claude/skills/`**, loaded when invoked: `/create-feature`, `/create-component`, `/start-task`, `/submit-pr`, `/full-review`, `/run-tests`, `/run-e2e` and others.

**`docs/lessons/`**, read when relevant: the full text of every rule, plus `project-overview.md` (layout, deployment, per-site architecture, every command, the section and feature how-tos). Never `@`-import a lesson; that loads it at launch. Budget, measured at bytes divided by 3: at most 10,000 tokens at session start and 25,000 in a task; root under 200 lines, each rule under 100.
