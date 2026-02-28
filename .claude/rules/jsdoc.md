# JSDoc Documentation

## Policy

All exported symbols **must** have up-to-date JSDoc documentation. This is enforced by `eslint-plugin-jsdoc` (warnings surface during `pnpm lint`).

## What to document

- Every exported `function`, `const` (arrow/function expression), `type`, and `interface`
- Shared hooks (`use*`), utilities, domain types, and constants are highest priority
- React components: describe what the component renders, not its internals
- `src/components/ui/` (shadcn auto-generated) and `src/test/` are exempt

## Format

```ts
/**
 * Brief description of what this does or represents.
 *
 * @param foo - What this parameter controls.
 * @returns The resolved value or ref.
 * @example
 * cn("base", condition && "extra") // → "base extra"
 */
export function example(foo: string): string { ... }
```

Rules:

- 1–3 sentences max in the description
- Add `@param` only when the name/type don't make intent obvious
- Add `@returns` for hooks and utils returning non-trivial values
- Add `@example` only for utilities where usage isn't obvious
- Do **not** duplicate what TypeScript types already express

## Keeping docs current

**Whenever you touch a file**, update the JSDoc of every exported symbol you modified or that is affected by your change:

- Changed a function's behaviour → update its `/** */` block
- Changed a prop interface → update the interface doc
- Renamed or moved an export → update the doc at its new location
- Added a new export → add a `/** */` block before committing

The pre-commit lint hook will warn on missing descriptions. Treat JSDoc warnings as errors — fix them before the commit.
