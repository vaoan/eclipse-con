# Repository Guidelines

## Project Structure & Module Organization

This is a pnpm workspace. **Moonfest 2026 has concluded — Sunfest 2027 is the
active site and the target of every unsuffixed command.**

- `apps/sunfest2027/` — active site. A single scrolling page: `src/sections/` (one file per full-screen section), `src/components/`, `src/lib/` (hooks and utils), `src/locales/`, `src/assets/`, and `src/index.css` for all styling.
- `apps/moonfest2026/` — archived site, kept buildable. Clean Architecture: `src/app/` (shell), `src/features/<feature>/` with `domain/`, `application/`, `infrastructure/`, `presentation/`, `src/shared/` with the same split, `src/test/`.
- `packages/telegram-sync/` — Telegram → site news sync, used by moonfest2026 only.
- `cloudflare/`, `wrangler.sunfest.toml` — Sunfest asset worker and its deploy config.
- Static assets live in each app's `public/`.

Match the structure of the app you are editing; do not port one app's
conventions onto the other.

## Build, Test, and Development Commands

Unsuffixed commands act on sunfest2027.

- `pnpm dev`: start the Vite dev server at `http://localhost:5173`.
- `pnpm build`: typecheck and create a production build (single-file HTML).
- `pnpm build:static`: same build, emitted to `dist-static/`.
- `pnpm preview`: serve the production build locally.
- `pnpm typecheck`: TypeScript checks only.
- `pnpm test`: run unit tests (Vitest).
- `pnpm deploy:sunfest`: build and deploy to the Cloudflare Worker.
- `pnpm lint`: run ESLint across the workspace.
- `pnpm format` / `pnpm format:check`: format or verify formatting with Prettier.
- `pnpm check:style` / `pnpm check:tools`: Stylelint; cspell + knip + jscpd + ls-lint.

Moonfest equivalents are suffixed: `pnpm dev:moonfest`, `build:moonfest`,
`typecheck:moonfest`, `test:moonfest`, `test:e2e:moonfest`,
`deploy:cloudflare:moonfest`, `version:auto:moonfest`,
`sync:telegram:moonfest2026`.

## Coding Style & Naming Conventions

- TypeScript strict mode; function components only.
- Indentation: follow Prettier defaults (2 spaces; no manual alignment).
- Files: PascalCase for components/types, camelCase for hooks/utils, kebab-case for configs.
- Components and types: PascalCase; hooks: `use*`; constants: `UPPER_SNAKE_CASE`.
- Imports use the `@/*` alias to the current app's `src/*`; prefer `import type`. Never import across apps.
- UI strings must use `useTranslation()` with dot notation keys (e.g., `feature.section.key`).
- Sunfest styling is hand-written CSS in `src/index.css` driven by `@theme` colour tokens — not Tailwind utilities in JSX, and never literal colours.

## Testing Guidelines

- Unit tests: Vitest + Testing Library. E2E: Playwright (moonfest2026 only).
- Test files: `*.test.ts` / `*.test.tsx`, kept next to the source file.
- Tests assert i18n **keys**, not translated copy — `t()` is mocked to return its key.

## Commit & Pull Request Guidelines

- Commit messages follow Conventional Commits: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`, `style:`.
- Run `pnpm typecheck && pnpm lint && pnpm build` before committing.
- Do not commit secrets or `.env.local`.
- PRs should include a clear summary, testing notes, and screenshots for UI changes.

## Configuration & Environment

- sunfest2027 reads no environment variables — it is a static single-file site.
- moonfest2026 keeps safe defaults in `apps/moonfest2026/.env.example`; analytics keys, local overrides, and secrets go in `.env.local` or `.env.development`.
- Vite env vars must be prefixed with `VITE_` and accessed via `src/shared/infrastructure/config/environment.ts`.
- `pnpm sync:secrets` pulls repository secrets into a local `.secrets` file.
