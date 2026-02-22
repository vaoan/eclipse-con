# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**eclipse-con** is a React single-page application (SPA) built with Vite, TypeScript, and Tailwind CSS v4. It follows Clean Architecture principles with a feature-based module structure.

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
| Build Tool      | Vite 6                     |
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

## Architecture

```
src/
├── app/                    # App shell (providers, router, layouts)
├── features/               # Feature modules (Clean Architecture)
│   └── [feature]/
│       ├── domain/         # Types, constants, business rules
│       ├── application/    # Hooks, utils, services
│       ├── infrastructure/ # External integrations
│       └── presentation/   # Components, pages
├── shared/                 # App-wide shared code
│   ├── domain/             # Shared types, constants
│   ├── application/        # Shared hooks, utils
│   ├── infrastructure/     # Config, i18n, providers
│   └── presentation/       # Shared UI components
└── test/                   # Test setup
```

### Dependency Rules

- **Presentation** depends on **Application** and **Domain**
- **Application** depends on **Domain** only
- **Domain** has **no dependencies** on other layers
- Features **never** import from other features directly
- Shared code is accessible to all features

## Patterns & Conventions

### Components

- Function components only, one component per file
- Props interface with `readonly` modifier, suffixed with `Props`
- Use `tid()` for test IDs (stripped in production)
- Use `cn()` for Tailwind class merging
- Use `useTranslation()` for all display strings (never hardcode)

### Naming

- **Files**: PascalCase for components/types, camelCase for utils/hooks, kebab-case for configs
- **Components**: PascalCase
- **Hooks**: `use*` prefix
- **Types/Interfaces**: PascalCase (no `I` prefix)
- **Constants**: `UPPER_SNAKE_CASE`
- **Test files**: `*.test.tsx` / `*.test.ts`

### Imports

- Use `@/*` path alias for all imports (resolves to `src/*`)
- Prefer type imports: `import type { Foo } from "..."`

### i18n

- All user-facing strings must use `t()` from `react-i18next`
- Translation keys: `feature.section.key` (dot notation)
- Locales: `en`, `es` in `src/shared/infrastructure/i18n/locales/`
- Always update both locale files when adding keys

## Design Principles

- **DRY**: Extract shared logic after 3 occurrences
- **SOLID**: Single responsibility per module, depend on abstractions
- **KISS**: Prefer readability over cleverness, avoid premature optimization

## Quick Reference

### Commands

```bash
pnpm dev              # Start dev server (localhost:5173)
pnpm build            # TypeScript check + production build
pnpm preview          # Preview production build
pnpm typecheck        # TypeScript type checking only
pnpm lint             # ESLint
pnpm format           # Prettier (write)
pnpm format:check     # Prettier (check only)
pnpm test             # Run unit tests
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Run tests with coverage report
pnpm test:e2e         # Run Playwright E2E tests
```

### Before Committing

Always run these checks:

```bash
pnpm typecheck && pnpm lint && pnpm build
```

### Environment Variables

- Defined in `.env.development` (committed, safe defaults)
- Secrets go in `.env.local` (gitignored)
- Access via `src/shared/infrastructure/config/environment.ts`
- All Vite env vars must be prefixed with `VITE_`

### Creating a New Feature

1. Create directory: `src/features/[name]/`
2. Add subdirs: `domain/`, `application/`, `infrastructure/`, `presentation/`
3. Create barrel export: `index.ts`
4. Add page component in `presentation/`
5. Register route in `src/app/router.tsx`
6. Add translation keys to `en.json` and `es.json`

## Claude Rules & Skills

- See `.claude/rules/` for detailed coding standards (~18 rules)
- See `.claude/skills/` for task-specific workflows (~14 skills)
