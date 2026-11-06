# Tailwind CSS

## Utility-First

Use Tailwind utility classes directly in JSX. Avoid writing custom CSS unless absolutely necessary.

```tsx
// Correct
<div className="flex items-center gap-4 rounded-lg bg-surface p-4">

// Wrong — avoid custom CSS files
<div className="user-card-wrapper">
```

## Conditional Classes with cn()

Use the `cn()` utility (clsx + twMerge) for conditional and merged classes:

```tsx
<button className={cn(
  'rounded-md px-4 py-2 font-medium',
  variant === 'primary' && 'bg-primary text-on-primary',
  variant === 'secondary' && 'bg-secondary text-on-secondary',
  disabled && 'opacity-50 cursor-not-allowed',
)}>
```

## Component Variants with CVA

Use **class-variance-authority (CVA)** for components with multiple variants:

```ts
const buttonVariants = cva("rounded-md px-4 py-2 font-medium", {
  variants: {
    intent: {
      primary: "bg-primary text-on-primary",
      secondary: "bg-secondary text-on-secondary",
    },
    size: {
      sm: "text-sm px-3 py-1",
      md: "text-base px-4 py-2",
    },
  },
  defaultVariants: {
    intent: "primary",
    size: "md",
  },
});
```

## Mobile-First Responsive Design

Always start with the mobile layout and add breakpoints upward:

```tsx
<div className="flex flex-col md:flex-row lg:gap-8">
```

## Semantic Color Tokens

Use semantic color tokens defined in the theme (e.g., `bg-surface`, `text-primary`, `border-muted`). Do not use raw Tailwind color scales (`bg-blue-500`) unless no semantic token fits.

## No Arbitrary Values When Tokens Exist

If a design token covers the value, use it. Avoid arbitrary values like `w-[347px]` when `w-full` or a spacing token works.
