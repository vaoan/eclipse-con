---
paths:
  - "**/*.test.{ts,tsx}"
  - "**/vitest.*"
  - "**/test-setup.ts"
  - "apps/links/worker/test/**"
  - "apps/moonfest2026/src/test/**"
---

# Testing

Loaded when a test or vitest config is read. Each line is the rule; the link is the full text. Test selectors for Playwright live in `e2e-selectors`; assertions on translated text live in `i18n-testing`.

- **Use Vitest and React Testing Library, and test behaviour, never internal state**, so a refactor does not break the suite. → `docs/lessons/testing.md` (Unit Tests)
- **Query by `getByRole` first, then `getByText`, `getByLabelText`, and `getByTestId` (with `tid()`) last.** Never `querySelector` or class-name queries. → `docs/lessons/testing.md` (Preferred Queries)
- **Put the test file next to its source** (`UserCard.tsx`, `UserCard.test.tsx`), named `*.test.ts` or `*.test.tsx`. → `docs/lessons/testing.md` (File Placement)
- **Mock external dependencies (API clients, third-party libraries) with `vi.mock()` / `vi.fn()`; do not mock internal hooks or utils of the same feature**, or nothing real is under test. → `docs/lessons/testing.md` (Mocking Rules)
- **Hold coverage at 85% for statements, branches, functions and lines.** → `docs/lessons/testing.md` (Coverage Thresholds)
- **Structure each test as Arrange, Act, Assert**, and `await screen.findBy*` for anything async. → `docs/lessons/testing.md` (Test Structure)
- **Playwright exists for `apps/moonfest2026` only** (`e2e/`, `pnpm test:e2e:moonfest`); Sunfest has no E2E suite, so do not write one for it. → `docs/lessons/testing.md` (E2E Tests)
- **Worker tests in `apps/links/worker/` run in Node against `worker/test/d1.ts`** (`node:sqlite` standing in for D1, real migrations applied): extend that helper rather than mocking D1. → `CLAUDE.md` (links)
