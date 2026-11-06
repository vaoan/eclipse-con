# React Component Patterns

## Function Components Only

Never use class components. All components must be function components.

```tsx
// Correct
export function UserCard({ name, role }: Readonly<UserCardProps>) {
  return <div>...</div>;
}

// Wrong - no class components
class UserCard extends React.Component { ... }
```

## Props Interface

- Define a props interface with the `Props` suffix.
- Mark all properties as `readonly`.

```tsx
interface UserCardProps {
  readonly name: string;
  readonly role: string;
  readonly onSelect?: (id: string) => void;
}
```

## One Component Per File

Each file exports exactly one React component. See `one-component-per-file.md` for details.

## Colocation

Keep related files together:

```
UserCard/
  UserCard.tsx
  UserCard.test.tsx
  UserCard.types.ts    # Only if types are complex
  useUserCard.ts       # Component-specific hook
```

## Composition Over Inheritance

Build complex UI by composing smaller components, never by extending them.

```tsx
// Correct
function ProfileCard({ user }: Readonly<ProfileCardProps>) {
  return (
    <Card>
      <Avatar src={user.avatar} />
      <UserInfo name={user.name} />
    </Card>
  );
}
```

## Size Limit

Keep components under **100 lines**. If a component exceeds this limit:

1. Extract logic into a custom hook.
2. Break the JSX into smaller sub-components.
3. Move complex conditionals into helper functions.

## Extract Logic Into Custom Hooks

Stateful logic, side effects, and complex computations belong in custom hooks, not in the component body.

```tsx
// useUserCard.ts
export function useUserCard(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  // ... fetch logic
  return { user, isLoading };
}

// UserCard.tsx
export function UserCard({ userId }: Readonly<UserCardProps>) {
  const { user, isLoading } = useUserCard(userId);
  if (isLoading) return <Skeleton />;
  return <div>{user.name}</div>;
}
```
