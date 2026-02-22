# Git Workflow

## Branch Naming

Use prefixed branch names that describe the change:

| Prefix      | Purpose                   | Example                 |
| ----------- | ------------------------- | ----------------------- |
| `feature/`  | New functionality         | `feature/user-profile`  |
| `fix/`      | Bug fix                   | `fix/login-redirect`    |
| `chore/`    | Maintenance, deps, config | `chore/update-tailwind` |
| `refactor/` | Code restructuring        | `refactor/auth-service` |

## Conventional Commits

Commit messages follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>: <short description>

[optional body]

[optional footer]
```

Allowed types:

| Type       | Use for                                    |
| ---------- | ------------------------------------------ |
| `feat`     | New feature                                |
| `fix`      | Bug fix                                    |
| `chore`    | Maintenance, tooling, deps                 |
| `refactor` | Code restructuring without behavior change |
| `docs`     | Documentation only                         |
| `test`     | Adding or updating tests                   |
| `style`    | Formatting, whitespace (no logic change)   |

Example:

```
feat: add login form with validation

Implements email/password form with client-side validation
using react-hook-form and zod schema.
```

## Pull Requests

- Each PR should focus on a **single concern**.
- Keep PRs small and reviewable.
- Include a clear description of what changed and why.

## AI Co-Authorship

All AI-generated commits must include the co-author footer:

```
Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```
