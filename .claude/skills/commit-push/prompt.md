# Commit and Push

Skill for committing and pushing code changes following project conventions.

## Steps

1. **Run all checks before committing**:

   ```bash
   pnpm typecheck && pnpm lint && pnpm build
   ```

   If any check fails, fix the issues before proceeding.

2. **Review changes**:

   ```bash
   git status
   git diff
   git diff --staged
   ```

3. **Stage specific files** (never use `git add -A` or `git add .`):

   ```bash
   git add src/features/[feature]/component.tsx
   git add src/features/[feature]/component.test.tsx
   ```

   - Only stage files related to the current change.
   - Never stage `.env` files, credentials, or secrets.

4. **Write a conventional commit message**:
   - Format: `type(scope): description`
   - Types: `feat`, `fix`, `refactor`, `test`, `docs`, `style`, `chore`, `perf`, `ci`
   - Scope: feature name or area of the codebase
   - Description: imperative mood, lowercase, no period at end
   - Examples:
     - `feat(auth): add login page component`
     - `fix(i18n): correct missing translation keys`
     - `refactor(shared): extract cn utility function`
     - `test(dashboard): add unit tests for chart component`

5. **Include Co-Authored-By trailer**:

   ```
   Co-Authored-By: Claude <noreply@anthropic.com>
   ```

6. **Push to current branch**:
   ```bash
   git push origin HEAD
   ```

## Commit Message Template

```
type(scope): short description

Optional longer description explaining the "why" behind the change.
Keep it concise, 1-2 sentences maximum.

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Rules

- Never force push unless explicitly asked.
- Never push to `main` or `master` directly.
- One logical change per commit.
- All checks must pass before committing.
