# Run E2E Tests

Skill for running end-to-end tests using Playwright.

## Steps

1. **Install browsers** (first time or after Playwright version update):

   ```bash
   pnpm exec playwright install
   ```

2. **Run all E2E tests**:

   ```bash
   pnpm test:e2e
   ```

3. **Run E2E tests in UI mode** (for interactive debugging):

   ```bash
   pnpm test:e2e:ui
   ```

4. **Run a specific test file**:

   ```bash
   pnpm exec playwright test tests/e2e/auth.spec.ts
   ```

5. **Debug failures using traces**:
   - Playwright generates traces on failure.
   - View traces with:
     ```bash
     pnpm exec playwright show-trace test-results/[test-name]/trace.zip
     ```
   - Traces include screenshots, network requests, and DOM snapshots at each step.

6. **Use `getByTestId` selectors only**:
   - All element selection in E2E tests must use `data-testid` attributes.
   - Use `page.getByTestId('element-id')` for locating elements.
   - Never select by CSS class, tag name, or text content (text may change with i18n).

## E2E Test Template

```ts
import { test, expect } from "@playwright/test";

test.describe("Feature Name", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/feature-route");
  });

  test("should display the page correctly", async ({ page }) => {
    await expect(page.getByTestId("page-title")).toBeVisible();
  });

  test("should handle user interaction", async ({ page }) => {
    await page.getByTestId("action-button").click();
    await expect(page.getByTestId("result")).toBeVisible();
  });
});
```

## Debugging Tips

- Use `test.only()` to isolate a single test during debugging.
- Use `await page.pause()` to pause execution and inspect the page.
- Check the HTML report after test runs: `pnpm exec playwright show-report`.
- Look at screenshots in `test-results/` for visual debugging.

## Rules

- E2E tests must not depend on external APIs; use mocks or fixtures.
- Keep E2E tests focused on critical user flows.
- Use `data-testid` attributes exclusively for element selection.
- Clean up any test data created during test execution.
- Tests must be independent and able to run in any order.
