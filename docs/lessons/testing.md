# Testing Standards

## Unit Tests — Vitest + Testing Library

- Use **Vitest** as the test runner.
- Use **React Testing Library** for component tests.
- Test **behavior**, not implementation details. Never assert on internal state or implementation.

## Preferred Queries (in priority order)

1. `getByRole` — accessible role queries (best).
2. `getByText` — visible text content.
3. `getByLabelText` — form elements by label.
4. `getByTestId` — fallback using `tid()` utility.

Avoid `querySelector`, `getByClassName`, or other DOM-structure queries.

## Test IDs

Use the `tid()` utility to generate `data-testid` attributes:

```tsx
<button data-testid={tid("submit-button")}>Submit</button>
```

## Coverage Thresholds

Maintain a minimum of **85%** coverage across:

- Statements
- Branches
- Functions
- Lines

## File Placement

Test files live **next to** the source file they test:

```
UserCard.tsx
UserCard.test.tsx
```

## Mocking Rules

- **Do** mock external dependencies (API clients, third-party libraries).
- **Do not** mock internal modules (hooks, utils within the same feature).
- Use `vi.mock()` for module mocks and `vi.fn()` for function mocks.

## E2E Tests — Playwright

- E2E tests exist for `apps/moonfest2026` only; the active `apps/sunfest2027` site has no E2E suite.
- E2E tests live in the `e2e/` directory at that app's root, run with `pnpm test:e2e:moonfest`.
- Use Playwright for browser-based end-to-end testing.
- Use `page.getByTestId()` for element selection.
- See `e2e-selectors.md` for selector rules.

## Test Structure

Follow Arrange-Act-Assert (AAA) pattern:

```ts
it('should display user name after loading', async () => {
  // Arrange
  const user = createMockUser({ name: 'Zenos' });
  mockGetUser.mockResolvedValue(user);

  // Act
  render(<UserCard userId={user.id} />);

  // Assert
  expect(await screen.findByText('Zenos')).toBeInTheDocument();
});
```
