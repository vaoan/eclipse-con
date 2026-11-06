---
paths:
  - "**/presentation/**/*.tsx"
  - "apps/*/src/components/**"
  - "apps/*/src/sections/**"
---

# One Component Per File

Loaded when a component is read. Each line is the rule; the link is the full text.

- **Each file exports exactly one React component**, so it is easy to find, test and refactor. → `docs/lessons/one-component-per-file.md` (Rule)
- **Non-component helpers used only in the same file may stay private** (`formatDisplayName`). → `docs/lessons/one-component-per-file.md` (Private Helpers Are OK)
- **A props type used only by this component lives in its file; one used elsewhere moves to a `.types.ts` file or the domain layer.** → `docs/lessons/one-component-per-file.md` (Component-Specific Types)
- **A styled sub-element used by more than one component gets its own file; one used only by its parent stays a private, unexported helper.** → `docs/lessons/one-component-per-file.md` (Extracting Reusable Sub-Elements)
