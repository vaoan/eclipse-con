# Build Checks

## Before Committing

Run the following checks and ensure they all pass before creating a commit:

```bash
pnpm typecheck    # TypeScript type checking
pnpm lint         # ESLint
pnpm build        # Production build
```

All three must succeed with zero errors.

## CI Pipeline Order

The CI pipeline runs checks in this sequence:

1. **typecheck** — Verify type correctness.
2. **lint** — Enforce code style and quality rules.
3. **test** — Run Vitest unit and integration tests.
4. **build** — Ensure the production bundle compiles.

A failure at any stage blocks subsequent stages.

## Quick Feedback Loop

For rapid iteration during development, run individual checks:

```bash
pnpm typecheck    # Fast — checks types only
pnpm lint         # Checks code quality
pnpm test         # Runs unit tests
pnpm build        # Full production build
```

Run the full suite before pushing to ensure the CI pipeline will pass.
