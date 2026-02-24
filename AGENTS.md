# Repository Guidelines

## Project Structure & Module Organization

- `src/` contains the React SPA code organized by Clean Architecture feature modules.
- `src/app/` holds app shell concerns (providers, router, layouts).
- `src/features/<feature>/` contains `domain/`, `application/`, `infrastructure/`, and `presentation/` layers.
- `src/shared/` provides shared code with the same layer split.
- `src/test/` contains test setup utilities.
- Static assets live in `public/`.

## Build, Test, and Development Commands

- `pnpm dev`: start the Vite dev server at `http://localhost:5173`.
- `pnpm build`: typecheck and create a production build.
- `pnpm preview`: serve the production build locally.
- `pnpm typecheck`: TypeScript checks only.
- `pnpm lint`: run ESLint.
- `pnpm format` / `pnpm format:check`: format or verify formatting with Prettier.
- `pnpm test`, `pnpm test:watch`, `pnpm test:coverage`: run unit tests (Vitest).
- `pnpm test:e2e`: run Playwright E2E tests.

## Coding Style & Naming Conventions

- TypeScript strict mode; function components only.
- Indentation: follow Prettier defaults (2 spaces; no manual alignment).
- Files: PascalCase for components/types, camelCase for hooks/utils, kebab-case for configs.
- Components and types: PascalCase; hooks: `use*`; constants: `UPPER_SNAKE_CASE`.
- Imports use the `@/*` alias to `src/*`; prefer `import type`.
- UI strings must use `useTranslation()` with dot notation keys (e.g., `feature.section.key`).

## Testing Guidelines

- Unit tests: Vitest + Testing Library; E2E: Playwright.
- Test files: `*.test.ts` / `*.test.tsx`.
- Keep tests close to their feature modules when feasible.

## Commit & Pull Request Guidelines

- Commit messages follow Conventional Commits: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`, `style:`.
- Run `pnpm typecheck && pnpm lint && pnpm build` before committing.
- Do not commit secrets or `.env.local`.
- PRs should include a clear summary, testing notes, and screenshots for UI changes.

## Configuration & Environment

- Defaults live in `.env.development`; secrets go in `.env.local`.
- Vite env vars must be prefixed with `VITE_` and accessed via `src/shared/infrastructure/config/environment.ts`.
