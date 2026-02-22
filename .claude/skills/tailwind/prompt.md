# Tailwind CSS

Skill for styling components using Tailwind CSS v4 utilities and conventions.

## Steps

1. **Use utility classes from Tailwind**:
   - Apply styles directly using Tailwind utility classes.
   - Avoid writing custom CSS unless absolutely necessary.
   - Use the `@apply` directive sparingly; prefer utility classes in JSX.

2. **Use `cn()` for conditional classes**:

   ```tsx
   import { cn } from "@/shared/utils/cn";

   <div
     className={cn(
       "base-classes here",
       isActive && "active-classes",
       variant === "primary" && "primary-classes",
       className
     )}
   />;
   ```

3. **Use CVA (Class Variance Authority) for component variants**:

   ```tsx
   import { cva, type VariantProps } from "class-variance-authority";

   const buttonVariants = cva(
     "inline-flex items-center justify-center rounded-md font-medium transition-colors",
     {
       variants: {
         variant: {
           primary: "bg-primary text-white hover:bg-primary/90",
           secondary:
             "bg-secondary text-secondary-foreground hover:bg-secondary/80",
           ghost: "hover:bg-accent hover:text-accent-foreground",
         },
         size: {
           sm: "h-8 px-3 text-sm",
           md: "h-10 px-4",
           lg: "h-12 px-6 text-lg",
         },
       },
       defaultVariants: {
         variant: "primary",
         size: "md",
       },
     }
   );
   ```

4. **Follow mobile-first responsive design**:
   - Start with mobile styles as the base.
   - Add responsive modifiers for larger screens: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`.
   - Example: `text-sm md:text-base lg:text-lg`

5. **Use semantic color tokens from theme**:
   - Prefer theme tokens over raw color values.
   - Use tokens like `bg-primary`, `text-foreground`, `border-border`.
   - Avoid hardcoded hex or RGB values.

6. **Check for consistency with existing components**:
   - Review similar components for spacing, sizing, and color patterns.
   - Maintain consistent padding, margins, and gap values.
   - Reuse existing patterns rather than inventing new ones.

## Common Patterns

- **Spacing**: Use consistent scale (`p-2`, `p-4`, `p-6`, `gap-2`, `gap-4`)
- **Flex layouts**: `flex items-center gap-2`, `flex flex-col gap-4`
- **Grid layouts**: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`
- **Cards**: `rounded-lg border bg-card p-4 shadow-sm`
- **Focus states**: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`

## Rules

- Never use inline `style` attributes for layout or theming.
- Always merge external `className` props using `cn()`.
- Keep class strings readable; break long class lists across lines if needed.
- Use Tailwind's dark mode variant (`dark:`) for dark theme support.
