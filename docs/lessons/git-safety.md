# Git Safety

## Never Force Push to Main

Do not run `git push --force` or `git push --force-with-lease` against `main`. This can destroy shared history.

## Never Skip Hooks

Do not use `--no-verify` on commits or pushes. Pre-commit and pre-push hooks exist to enforce quality standards.

## Never Commit Secrets

The following must never be committed:

- `.env.local`
- `.env.*.local`
- Any file containing API keys, tokens, passwords, or credentials

If accidentally staged, unstage immediately. If accidentally committed, alert the team.

## Always Create New Commits

When making changes, create a **new commit**. Do not amend a previous commit unless the user explicitly requests it. Amending after a failed pre-commit hook can destroy the previous commit's content.

## Stage Specific Files

Use `git add <file>` for specific files. Avoid `git add -A` or `git add .`, which can accidentally include sensitive or unintended files.

```bash
# Correct
git add src/features/auth/LoginPage.tsx src/features/auth/LoginPage.test.tsx

# Avoid
git add -A
```
