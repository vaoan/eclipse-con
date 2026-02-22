# Code Review

Skill for reviewing code changes against project standards and best practices.

## Checklist

Review each changed file against the following criteria:

### TypeScript Strictness

- No usage of `any` type. Use `unknown`, generics, or proper type definitions instead.
- All function parameters and return types are explicitly typed.
- No type assertions (`as`) unless absolutely necessary and justified with a comment.
- Interfaces preferred over type aliases for object shapes.

### i18n Compliance

- No hardcoded user-facing strings in components.
- All display text uses `useTranslation()` hook and `t()` function.
- Translation keys follow dot notation: `feature.section.key`.
- Keys exist in both `en.json` and `es.json`.

### Test Coverage

- New components have corresponding `.test.tsx` files.
- New hooks have corresponding `.test.ts` files.
- Tests cover the happy path and key edge cases.
- Tests use `getByTestId` with `tid()` for element selection.

### Naming Conventions

- Components: `PascalCase` (e.g., `UserProfile.tsx`)
- Hooks: `use` prefix + `PascalCase` (e.g., `useAuth.ts`)
- Utilities: `camelCase` (e.g., `formatDate.ts`)
- Types/Interfaces: `PascalCase` (e.g., `UserProfile`)
- Constants: `UPPER_SNAKE_CASE`
- Test files: `[Name].test.tsx` or `[Name].test.ts`

### Clean Architecture Boundaries

- Domain layer has no imports from application, infrastructure, or presentation.
- Application layer does not import from infrastructure or presentation.
- Infrastructure implements interfaces defined in domain.
- Features do not import from other features' internal modules.

### Code Quality

- No `console.log` or `debugger` statements left in code.
- Proper error handling with try/catch or error boundaries.
- No magic numbers; use named constants.
- Single responsibility per file and function.
- Functions are small and focused.

### Accessibility

- Interactive elements have proper ARIA attributes.
- Images have alt text.
- Form inputs have labels.
- Color is not the only means of conveying information.

## How to Run

1. Review the diff: `git diff` or `git diff --staged`
2. Go through each checklist item for every changed file.
3. Report issues with file path, line number, and suggested fix.
4. Classify issues as: **Error** (must fix), **Warning** (should fix), **Suggestion** (nice to have).
