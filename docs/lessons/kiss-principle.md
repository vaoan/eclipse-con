# KISS Principle

**Keep It Simple, Stupid** — simplicity is a primary goal in design.

## Readability Over Cleverness

Write code that any team member can understand at a glance. Avoid clever one-liners, obscure patterns, or unnecessary abstractions.

```ts
// Clever but unclear
const result = data?.items?.reduce((a, b) => ({ ...a, [b.id]: b }), {}) ?? {};

// Clear
const result: Record<string, Item> = {};
for (const item of data?.items ?? []) {
  result[item.id] = item;
}
```

## No Premature Optimization

Write correct, clear code first. Optimize only when there is a measured performance problem. Profiling determines what to optimize, not assumptions.

## Minimal API Surface

Components should expose the smallest possible set of props needed for their use cases. Do not add "just in case" props.

```tsx
// Over-engineered
interface CardProps {
  readonly title: string;
  readonly titleTag?: "h1" | "h2" | "h3" | "h4";
  readonly titleClassName?: string;
  readonly onTitleClick?: () => void;
}

// Simple — add more props only when there is a real need
interface CardProps {
  readonly title: string;
  readonly children: React.ReactNode;
}
```

## Simple Data Flow

- Props flow down, events flow up.
- Prefer local state; lift state only when sibling components need it.
- Use context sparingly and only for truly global concerns (theme, auth, locale).
- Avoid deeply nested state management unless complexity demands it.
