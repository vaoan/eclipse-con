# Full Review

Skill for running a comprehensive review of the codebase covering all quality checks.

## Run All Checks

Execute each check sequentially. If any check fails, report the failure and suggest fixes.

### 1. Type Checking

```bash
pnpm typecheck
```

Verify there are no TypeScript errors. Fix any type issues found.

### 2. Linting

```bash
pnpm lint
```

Ensure all files pass ESLint rules. Fix any violations.

### 3. Unit Tests

```bash
pnpm test
```

All unit tests must pass. Investigate and fix any failures.

### 4. Build

```bash
pnpm build
```

The project must build successfully without errors or warnings.

### 5. Architecture Compliance Review

- Verify Clean Architecture layer boundaries are respected:
  - `domain/` has no imports from `application/`, `infrastructure/`, or `presentation/`.
  - `application/` does not import from `infrastructure/` or `presentation/`.
  - Features do not import from other features' internal modules.
- Check that barrel exports (`index.ts`) expose only the public API.

### 6. i18n Coverage Check

- Verify no hardcoded user-facing strings exist in components.
- Confirm all translation keys exist in both `en.json` and `es.json`.
- Check that key structures match between locale files.

### 7. Test Coverage Check

```bash
pnpm test:coverage
```

- Verify coverage meets the 85% threshold for:
  - Statements
  - Branches
  - Functions
  - Lines
- Identify any new code lacking test coverage.

### 8. Naming Conventions Check

- Components: `PascalCase.tsx`
- Hooks: `use[Name].ts`
- Utilities: `camelCase.ts`
- Types: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Test files: `[Name].test.ts(x)`
- Feature directories: `kebab-case`

## Output

Provide a summary report:

- **Pass/Fail** status for each check.
- List of issues found, grouped by category.
- Suggested fixes for each issue.
- Overall assessment: Ready to merge or needs work.

## Rules

- All 8 checks must pass for a "Ready to merge" assessment.
- Do not skip any check.
- Report issues with specific file paths and line numbers.
