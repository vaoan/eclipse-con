# Code Review Standards

When reviewing code (or self-checking before committing), verify the following:

## Type Safety

- No `any` types unless explicitly justified with a comment.
- Proper use of generics where applicable.
- Strict null checks are respected.

## Error Handling

- Async operations have proper error handling (try/catch or .catch).
- Errors are surfaced to the user meaningfully, not swallowed silently.
- Error boundaries are in place for component trees that may fail.

## Accessibility (a11y)

- Interactive elements are keyboard-navigable.
- Images have `alt` text.
- Form inputs have associated labels.
- ARIA attributes are used correctly when semantic HTML is insufficient.
- Color contrast meets WCAG AA standards.

## i18n Compliance

- All user-facing strings use `t()` from react-i18next.
- No hardcoded display text in JSX.
- Translation keys exist in all supported locale files (en, es).

## Test Coverage

- New features include unit tests.
- Changed behavior has updated tests.
- Critical paths have E2E coverage.
- Coverage thresholds are maintained (85%).

## Naming Conventions

- Files, variables, components, and types follow `naming-conventions.md`.
- No abbreviations that harm readability.

## Unnecessary Complexity

- No over-engineering or premature abstraction.
- No dead code or unused imports.
- Simple solutions preferred over clever ones.
- Functions and components are focused (single responsibility).
