# Run Tests

Skill for running unit and integration tests using Vitest.

## Steps

1. **Run unit tests**:

   ```bash
   pnpm test
   ```

   Runs all test files matching `*.test.ts` and `*.test.tsx`.

2. **Run tests in watch mode** (during development):

   ```bash
   pnpm test:watch
   ```

   Automatically re-runs tests when files change.

3. **Run tests with coverage**:

   ```bash
   pnpm test:coverage
   ```

   Generates a coverage report showing which lines and branches are covered.

4. **Run tests for a specific file or pattern**:

   ```bash
   pnpm test -- src/features/auth/
   pnpm test -- UserProfile.test.tsx
   ```

5. **Analyze failures and suggest fixes**:
   - Read the error message and stack trace carefully.
   - Identify whether the failure is in the test or the source code.
   - Check for common issues:
     - Missing mocks for dependencies.
     - Incorrect test setup or teardown.
     - Async operations not properly awaited.
     - Stale snapshots needing update.

6. **Check coverage thresholds**:
   - Target: **85%** coverage for statements, branches, functions, and lines.
   - Review uncovered lines and determine if they need tests.
   - Focus on testing business logic and user interactions.

## Common Test Patterns

### Component Test

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";

describe("Component", () => {
  it("renders correctly", () => {
    render(<Component />);
    expect(screen.getByTestId("component")).toBeInTheDocument();
  });

  it("handles user interaction", async () => {
    const user = userEvent.setup();
    render(<Component />);
    await user.click(screen.getByTestId("button"));
    expect(screen.getByText("Result")).toBeInTheDocument();
  });
});
```

### Hook Test

```ts
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";

describe("useCustomHook", () => {
  it("returns expected initial state", () => {
    const { result } = renderHook(() => useCustomHook());
    expect(result.current.value).toBe(initialValue);
  });
});
```

## Rules

- All tests must pass before committing.
- Never skip tests without a documented reason.
- Test behavior, not implementation details.
- Use `getByTestId` with `tid()` selectors for element queries.
