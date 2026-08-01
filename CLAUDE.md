# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**eclipse-con** is a pnpm workspace holding the Furry Colombia event sites. Each
site is a React single-page application built with Vite, TypeScript, and
Tailwind CSS v4.

**Moonfest 2026 has concluded. Sunfest 2027 is the active product** — it is what
every unsuffixed command (`pnpm dev`, `pnpm build`, `pnpm test`) targets, and it
is where new work goes by default.

## Repository Layout

```
apps/
├── sunfest2027/        # ACTIVE — the live Sunfest 2027 site
└── moonfest2026/       # ARCHIVED — Moonfest 2026, kept buildable for reference
packages/
└── telegram-sync/      # Telegram → site news sync (used by moonfest2026 only)
cloudflare/             # sunfest-worker.mjs — the Sunfest asset worker
docs/superpowers/       # Dated design specs and implementation plans (historical)
scripts/                # Workspace-level tooling (sync-secrets.mjs)
```

Deployment:

| App          | Host                         | Config                                       |
| ------------ | ---------------------------- | -------------------------------------------- |
| sunfest2027  | `sunfest.furrycolombia.com`  | `wrangler.sunfest.toml` (repo root)          |
| moonfest2026 | `moonfest.furrycolombia.com` | `apps/moonfest2026/wrangler.toml` (archived) |

## Git Safety

- **NEVER** force push to `main`
- **NEVER** use `--no-verify` to skip hooks
- **NEVER** commit `.env.local` or files containing secrets
- **ALWAYS** create new commits (don't amend unless explicitly asked)
- **ALWAYS** stage specific files (avoid `git add -A` or `git add .`)
- **ALWAYS** include `Co-Authored-By: Claude <noreply@anthropic.com>` in AI-generated commits
- Use conventional commits: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`, `style:`

## Technology Stack

| Category        | Technology                 |
| --------------- | -------------------------- |
| Framework       | React 19                   |
| Build Tool      | Vite 7                     |
| Language        | TypeScript 5 (strict mode) |
| Styling         | Tailwind CSS v4 + CVA      |
| Routing         | React Router v7            |
| i18n            | react-i18next              |
| Testing         | Vitest + Testing Library   |
| E2E Testing     | Playwright                 |
| Linting         | ESLint 9 (flat config)     |
| Formatting      | Prettier                   |
| Package Manager | pnpm 10                    |
| Icons           | lucide-react               |

React Router, Playwright, and CVA are used by `moonfest2026` only. `sunfest2027`
is a single-page scroll with no router and no E2E suite.

## Architecture

The two apps are deliberately structured differently — match the app you are
editing rather than importing one app's conventions into the other.

### sunfest2027 (active) — flat single-page structure

The site is one scrolling page, so it does not carry feature-module ceremony:

```
apps/sunfest2027/src/
├── App.tsx             # Composes the sections in scroll order
├── main.tsx            # Entry point
├── index.css           # All styling: @theme tokens + hand-written CSS
├── sections/           # One file per full-screen page section (+ tests)
├── components/         # Reusable pieces used across sections (+ tests)
├── lib/                # Hooks and utilities (cn, tid, useScrollReveal, …)
├── locales/            # en.json, es.json
├── assets/             # Imported images (hero, showcase, flags)
└── *.ts                # Content constants (showcase, carnaval, flags, socials)
```

Conventions specific to this app:

- **Sections are full-screen.** Every `.section` has `min-height: var(--section-min-h)` (`100svh`) and centres its content, so each one reads as its own beat. Sections with more content than fits simply grow past it — the height is a floor, not a fixed size.
- **Styling is hand-written CSS in `index.css`**, not Tailwind utilities in JSX. Colours come from the `@theme` tokens at the top of that file (`--color-yellow`, `--color-magenta`, `--color-purple`, `--color-teal`, …). Add a token rather than a literal.
- Section content lives in `src/locales/`, not the shared i18n folder.

### moonfest2026 (archived) — Clean Architecture

```
apps/moonfest2026/src/
├── app/                    # App shell (providers, router, layouts)
├── features/               # Feature modules
│   └── [feature]/
│       ├── domain/         # Types, constants, business rules
│       ├── application/    # Hooks, utils, services
│       ├── infrastructure/ # External integrations
│       └── presentation/   # Components, pages
├── shared/                 # App-wide shared code (same four layers)
└── test/                   # Test setup
```

Dependency rules:

- **Presentation** depends on **Application** and **Domain**
- **Application** depends on **Domain** only
- **Domain** has **no dependencies** on other layers
- Features **never** import from other features directly
- Shared code is accessible to all features

Treat this app as read-only maintenance. Do not port its structure onto
sunfest2027, and do not add features to it without being asked.

## Patterns & Conventions

These apply to **both** apps.

### Components

- Function components only, one component per file
- Props interface with `readonly` modifier, suffixed with `Props`
- Use `tid()` for test IDs (stripped in production)
- Use `cn()` for class merging
- Use `useTranslation()` for all display strings (never hardcode)

### Naming

- **Files**: PascalCase for components/types, camelCase for utils/hooks, kebab-case for configs
- **Components**: PascalCase
- **Hooks**: `use*` prefix
- **Types/Interfaces**: PascalCase (no `I` prefix)
- **Constants**: `UPPER_SNAKE_CASE`
- **Test files**: `*.test.tsx` / `*.test.ts`

### Imports

- Use `@/*` path alias for all imports (resolves to the app's `src/*`)
- Prefer type imports: `import type { Foo } from "..."`
- Never import across apps

### i18n

- All user-facing strings must use `t()` from `react-i18next`
- Translation keys: `feature.section.key` (dot notation)
- Locales: `en`, `es` — in `apps/sunfest2027/src/locales/` and `apps/moonfest2026/src/shared/infrastructure/i18n/locales/`
- Always update both locale files when adding keys
- **Tests assert i18n keys, not translated copy** — the test setup mocks `t()` to return its key, so tests reference keys (`getByRole("heading", { name: "about.title" })`), never wording. See `.claude/rules/i18n-testing.md`.

### JSDoc

- Every exported `function`, `const` (arrow/function expression), `type`, and `interface` **must** have a `/** ... */` block
- **Keep docs current**: whenever you touch a file, update the JSDoc of every symbol you modified or that is affected by your change
- Enforced by `eslint-plugin-jsdoc` — treat JSDoc warnings as errors and fix before committing
- See `.claude/rules/jsdoc.md` for full format guide

## Design Principles

- **DRY**: Extract shared logic after 3 occurrences
- **SOLID**: Single responsibility per module, depend on abstractions
- **KISS**: Prefer readability over cleverness, avoid premature optimization

## Quick Reference

### Commands

Unsuffixed commands act on **sunfest2027**. Moonfest equivalents are suffixed.

```bash
# Active site — Sunfest 2027
pnpm dev              # Start dev server (localhost:5173)
pnpm build            # TypeScript check + production build (single-file HTML)
pnpm build:static     # Same build, emitted to dist-static/
pnpm preview          # Preview production build
pnpm typecheck        # TypeScript type checking only
pnpm test             # Run unit tests (Vitest)
pnpm check:overflow   # Fail if the built page scrolls sideways at any width
pnpm deploy:sunfest   # Build + wrangler deploy --config wrangler.sunfest.toml

# Workspace-wide
pnpm lint             # ESLint across the workspace
pnpm format           # Prettier (write)
pnpm format:check     # Prettier (check only)
pnpm check:style      # Stylelint across all apps
pnpm check:tools      # cspell + knip + jscpd + ls-lint
pnpm sync:secrets     # Pull repo secrets into .secrets

# Archived site — Moonfest 2026
pnpm dev:moonfest
pnpm build:moonfest
pnpm typecheck:moonfest
pnpm test:moonfest
pnpm test:e2e:moonfest
pnpm build:static:moonfest
pnpm deploy:cloudflare:moonfest
pnpm version:auto:moonfest        # Bump VITE_APP_VERSION in its .env.example
pnpm sync:telegram:moonfest2026   # Telegram news sync (moonfest only)
```

Sunfest has no Telegram sync, no E2E suite, and no env/version scheme — it is a
static single-file site. Do not invent those commands for it. Its one
browser-driven check is `pnpm check:overflow`
(`apps/sunfest2027/scripts/check-overflow.mjs`), which loads the built artifact
in headless Chromium and fails if the page scrolls sideways at any viewport
width; run it after layout changes, and pass a URL to check a deployed build.

### Before Committing

Always run these checks:

```bash
pnpm typecheck && pnpm lint && pnpm build
```

The pre-commit hook runs `pnpm precommit` (lint-staged). It no longer bumps a
version number — Moonfest's bump is manual now.

### Environment Variables

Environment config applies to **moonfest2026 only**; sunfest2027 reads no env
vars.

- Safe defaults live in `apps/moonfest2026/.env.example`
- Keep analytics keys out of `.env.example`
- Local overrides and secrets go in `.env.local` or `.env.development` (gitignored)
- Access via `src/shared/infrastructure/config/environment.ts`
- All Vite env vars must be prefixed with `VITE_`

### Adding a Section to Sunfest 2027

1. Create `apps/sunfest2027/src/sections/[Name].tsx` and `[Name].test.tsx`
2. Give the root element `className={cn("section", "section-[name]", revealed && "is-revealed")}` and wire `useScrollReveal()`
3. Add `data-content-section` and `data-testid={tid("[name]")}` (see `.claude/rules/analytics-tracking.md`)
4. Add any new styles to `index.css` using the existing `@theme` tokens
5. Add translation keys to `src/locales/en.json` and `es.json`
6. Compose it into `src/App.tsx` in scroll order, with a `<GarlandDivider />` between sections

### Creating a New Feature (moonfest2026)

1. Create directory: `apps/moonfest2026/src/features/[name]/`
2. Add subdirs: `domain/`, `application/`, `infrastructure/`, `presentation/`
3. Create barrel export: `index.ts`
4. Add page component in `presentation/`
5. Register route in `src/app/router.tsx`
6. Add translation keys to `en.json` and `es.json`

## Claude Rules & Skills

- See `.claude/rules/` for detailed coding standards (~18 rules)
- See `.claude/skills/` for task-specific workflows (~14 skills)
