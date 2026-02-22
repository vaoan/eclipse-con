# One Component Per File

## Rule

Each file exports **exactly one React component**. This makes components easy to find, test, and refactor.

```
// UserCard.tsx — exports UserCard
// UserAvatar.tsx — exports UserAvatar
```

## Private Helpers Are OK

Helper functions that are only used within the same file and are not React components may coexist:

```tsx
function formatDisplayName(first: string, last: string): string {
  return `${first} ${last}`;
}

export function UserCard({ user }: Readonly<UserCardProps>) {
  return <span>{formatDisplayName(user.firstName, user.lastName)}</span>;
}
```

## Component-Specific Types

Types and interfaces that are used only by the component in the same file may be defined there:

```tsx
interface UserCardProps {
  readonly user: User;
}

export function UserCard({ user }: Readonly<UserCardProps>) { ... }
```

If the type is used by other files, move it to a dedicated `.types.ts` file or to the domain layer.

## Extracting Reusable Sub-Elements

If a styled sub-element is used in more than one component, extract it into its own file. If it is only used within the parent component, it may be a private helper in the same file — but it should **not** be exported.
