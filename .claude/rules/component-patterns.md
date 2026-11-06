---
paths:
  - "**/presentation/**/*.tsx"
  - "apps/*/src/components/**"
  - "apps/*/src/sections/**"
---

# Component Patterns

Loaded when a component is read. Each line is the rule; the link is the full text.

- **Function components only, never classes.** Type props as `Readonly<NameProps>`. → `docs/lessons/component-patterns.md` (Function Components Only)
- **Declare a `Props` interface with every property `readonly`.** → `docs/lessons/component-patterns.md` (Props Interface)
- **Export one component per file** (see `one-component-per-file`). → `docs/lessons/component-patterns.md` (One Component Per File)
- **Keep a component's own files together** (`UserCard.tsx`, `UserCard.test.tsx`, `useUserCard.ts`; `.types.ts` only when types are complex). → `docs/lessons/component-patterns.md` (Colocation)
- **Compose smaller components; never extend one.** → `docs/lessons/component-patterns.md` (Composition Over Inheritance)
- **Keep a component under 100 lines**: extract a hook, split the JSX, or move conditionals into helpers. → `docs/lessons/component-patterns.md` (Size Limit)
- **Put state, effects and heavy computation in a custom hook**, not the component body. → `docs/lessons/component-patterns.md` (Extract Logic Into Custom Hooks)
- **Use `tid()` for test ids and `cn()` for class merging**, and import by the `@/*` alias (the app's `src/*`), with `import type` for types. Never import across apps. → `CLAUDE.md` (Components, Imports)
