# Create Feature Module

Skill for creating a new feature module following Clean Architecture principles.

> **Scope: `apps/moonfest2026` only** — that app is archived, so you will rarely
> need this. The active site, `apps/sunfest2027`, is a single scrolling page with
> no feature modules: add a section under `src/sections/` instead (see the
> "Adding a Section" steps in `CLAUDE.md`). All paths below are relative to
> `apps/moonfest2026/`.

## Steps

1. **Create the feature directory structure** at `src/features/[name]/` with the following subdirectories:
   - `domain/` - Entity types, value objects, repository interfaces
   - `application/` - Use cases, custom hooks, state management
   - `infrastructure/` - API clients, external service adapters
   - `presentation/` - React components, pages, UI logic

2. **Create `index.ts` barrel export** at `src/features/[name]/index.ts` that re-exports the public API of the feature.

3. **Create placeholder types** in `domain/`:
   - `src/features/[name]/domain/types.ts` with the core entity interface(s) for the feature.

4. **Create a page component** at `src/features/[name]/presentation/[Name]Page.tsx`:
   - Use a functional component with proper TypeScript typing.
   - Use `useTranslation()` for any display text.
   - Use `tid()` for test IDs.
   - Include basic layout structure with Tailwind CSS classes.

5. **Add route** in `src/app/router.tsx`:
   - Import the page component lazily using `React.lazy()`.
   - Add the route path following existing conventions.

6. **Add translation keys** in locale files:
   - Add keys to `src/locales/en.json` under the feature namespace.
   - Add keys to `src/locales/es.json` under the feature namespace.
   - Use dot notation: `[featureName].page.title`, `[featureName].page.description`, etc.

## Naming Conventions

- Feature directory: `kebab-case` (e.g., `user-profile`)
- Page component: `PascalCase` + `Page` suffix (e.g., `UserProfilePage.tsx`)
- Types file: `types.ts`
- Barrel export: `index.ts`

## Architecture Rules

- Features must NOT import directly from other features' internal modules.
- Cross-feature communication goes through shared layers or the app layer.
- Domain layer has zero dependencies on other layers.
- Infrastructure implements interfaces defined in domain.
