# Submit Pull Request

Skill for creating a pull request with proper documentation and checks.

## Steps

1. **Ensure branch is up to date**:

   ```bash
   git fetch origin main
   git log origin/main..HEAD --oneline
   ```

   Verify all intended commits are present and no unintended changes are included.

2. **Run all checks**:

   ```bash
   pnpm typecheck
   pnpm lint
   pnpm test
   pnpm build
   ```

   All checks must pass before creating the PR. Fix any failures first.

3. **Push the branch** (if not already pushed):

   ```bash
   git push -u origin HEAD
   ```

4. **Create PR using `gh pr create`**:

   ```bash
   gh pr create --title "type(scope): short description" --body "$(cat <<'EOF'
   ## Summary
   - First change or feature added
   - Second change or improvement
   - Third change if applicable

   ## Test Plan
   - [ ] Unit tests pass (`pnpm test`)
   - [ ] Type checking passes (`pnpm typecheck`)
   - [ ] Lint passes (`pnpm lint`)
   - [ ] Build succeeds (`pnpm build`)
   - [ ] Manual testing of [specific feature]
   - [ ] E2E tests pass (if applicable)

   Generated with Claude Code
   EOF
   )"
   ```

5. **Return the PR URL** to the user.

## PR Title Format

- Follow conventional commit format: `type(scope): description`
- Keep under 70 characters.
- Use imperative mood.

## PR Body Format

- **Summary**: 1-3 bullet points describing what changed and why.
- **Test Plan**: Checklist of testing steps to verify the changes.
- Always include the "Generated with Claude Code" footer.

## Rules

- Never create PRs targeting `main` from a dirty working tree.
- Ensure all changes are committed before creating the PR.
- Review the diff one more time before submitting: `git diff origin/main...HEAD`.
