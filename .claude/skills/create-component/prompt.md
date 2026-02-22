# Create React Component

Skill for creating a new React component with proper typing, testing, and conventions.

## Steps

1. **Determine the component location**:
   - Shared component: `src/shared/presentation/components/[Name].tsx`
   - Feature-specific component: `src/features/[feature]/presentation/components/[Name].tsx`

2. **Create `[Name].tsx`** with the following structure:
   - Define a `Props` interface (e.g., `[Name]Props`) with explicit types.
   - Export the component as a named export.
   - Use `tid()` utility for test ID attributes.
   - Use `cn()` utility for className merging and conditional classes.
   - Use `useTranslation()` for any display text (no hardcoded strings).

3. **Create `[Name].test.tsx`** alongside the component:
   - Write a basic render test that verifies the component mounts without errors.
   - Test that key elements are present using `getByTestId`.
   - Test any conditional rendering logic.
   - Use `vi.mock()` for dependencies as needed.

4. **Export from barrel** file (`index.ts`) if one exists at the component's directory level.

## Component Template

```tsx
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/utils/cn';
import { tid } from '@/shared/utils/tid';

interface [Name]Props {
  className?: string;
}

export function [Name]({ className }: [Name]Props) {
  const { t } = useTranslation();

  return (
    <div className={cn('', className)} data-testid={tid('[name]')}>
      {t('[feature].[name].label')}
    </div>
  );
}
```

## Test Template

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { [Name] } from './[Name]';

describe('[Name]', () => {
  it('renders without crashing', () => {
    render(<[Name] />);
    expect(screen.getByTestId('[name]')).toBeInTheDocument();
  });
});
```

## Rules

- One component per file (single responsibility).
- Always define a `Props` interface, even if empty.
- Never use `any` type.
- Always include `className` as an optional prop for composability.
