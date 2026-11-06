---
paths:
  - "**/presentation/**/*.tsx"
  - "apps/*/src/components/**"
  - "apps/*/src/sections/**"
  - "**/*.css"
---

# Tailwind CSS

Loaded when a component or stylesheet is read. Each line is the rule; the link is the full text.

- **Sunfest 2027 is the exception: its styling is hand-written CSS in `src/index.css` on the `@theme` tokens** (`--color-yellow`, `--color-magenta`, ...), not utilities in JSX. Add a token rather than a literal. The utility-first lines below apply to Links and Moonfest. → `CLAUDE.md` (Sunfest conventions)
- **Use Tailwind utility classes in JSX; write custom CSS only when unavoidable.** → `docs/lessons/tailwind.md` (Utility-First)
- **Merge and condition classes with `cn()`** (clsx + twMerge), not string concatenation. → `docs/lessons/tailwind.md` (Conditional Classes with cn())
- **Use CVA for components with several variants** (`intent`, `size` with `defaultVariants`); CVA is used by Moonfest only. → `docs/lessons/tailwind.md` (Component Variants with CVA)
- **Design mobile first**: base layout, then `md:` and `lg:` upward. → `docs/lessons/tailwind.md` (Mobile-First Responsive Design)
- **Use semantic tokens (`bg-surface`, `text-primary`), not raw scales (`bg-blue-500`)**, and no arbitrary values like `w-[347px]` when a token or `w-full` works. → `docs/lessons/tailwind.md` (Semantic Color Tokens)
