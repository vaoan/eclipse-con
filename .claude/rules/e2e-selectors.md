---
paths:
  - "**/e2e/**"
  - "**/*.spec.ts"
  - "**/playwright*"
---

# E2E Selectors

Loaded when a Playwright spec is read (only `apps/moonfest2026/e2e/` has them). Each line is the rule; the link is the full text.

- **Select by `data-testid` made with `tid()`** (`page.getByTestId("login-submit")`), because it survives styling and refactors. → `docs/lessons/e2e-selectors.md` (Use data-testid via tid())
- **Never select by CSS class, DOM structure (`div > span:first-child`), component internals or framework-generated attributes.** → `docs/lessons/e2e-selectors.md` (Never Select By)
- **Never select by translated text** (`getByText("Iniciar sesion")`): it breaks when the locale changes. To assert text, build the expected value from the translation key or accept either locale. → `docs/lessons/e2e-selectors.md` (Translation-Agnostic Selectors)
- **Name test ids in kebab-case, scoped by feature when it helps** (`auth-login-submit`, `dashboard-stat-card`). → `docs/lessons/e2e-selectors.md` (Naming test IDs)
