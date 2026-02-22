# Naming Conventions

## File Names

| Type               | Case                        | Example                                   |
| ------------------ | --------------------------- | ----------------------------------------- |
| Components         | PascalCase                  | `UserCard.tsx`                            |
| Types / Interfaces | PascalCase                  | `UserProfile.ts`                          |
| Hooks              | camelCase with `use` prefix | `useAuth.ts`                              |
| Utilities          | camelCase                   | `formatDate.ts`                           |
| Services           | camelCase                   | `authService.ts`                          |
| Config files       | kebab-case                  | `vite-env.d.ts`, `tailwind.config.ts`     |
| Test files         | Same as source + `.test`    | `UserCard.test.tsx`, `formatDate.test.ts` |

## Identifiers

| Type                  | Convention                  | Example                           |
| --------------------- | --------------------------- | --------------------------------- |
| Components            | PascalCase                  | `UserCard`, `LoginPage`           |
| Hooks                 | camelCase, `use*` prefix    | `useAuth`, `useUserList`          |
| Functions / variables | camelCase                   | `getUserName`, `isActive`         |
| Types / Interfaces    | PascalCase, no `I` prefix   | `UserProfile`, `AuthState`        |
| Enums                 | PascalCase (name + members) | `UserRole.Admin`                  |
| Constants             | UPPER_SNAKE_CASE            | `MAX_RETRY_COUNT`, `API_BASE_URL` |
| CSS classes           | kebab-case (Tailwind)       | `text-primary`, `flex-col`        |

## Do Not

- Do **not** prefix interfaces with `I` (use `UserProfile`, not `IUserProfile`).
- Do **not** prefix types with `T` (use `AuthState`, not `TAuthState`).
- Do **not** use Hungarian notation.
