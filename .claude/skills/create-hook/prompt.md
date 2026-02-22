# Create Custom React Hook

Skill for creating a custom React hook with proper typing and testing.

## Steps

1. **Create `use[Name].ts`** in the appropriate `application/` layer:
   - Shared hook: `src/shared/application/hooks/use[Name].ts`
   - Feature-specific hook: `src/features/[feature]/application/use[Name].ts`

2. **Include proper TypeScript return type**:
   - Define an explicit return type interface or type alias.
   - Avoid returning anonymous object types.
   - Use `as const` for tuple returns if applicable.

3. **Create `use[Name].test.ts`** alongside the hook:
   - Use `renderHook` from `@testing-library/react` for testing.
   - Test initial state.
   - Test state transitions using `act()`.
   - Mock external dependencies with `vi.mock()`.

4. **Export from barrel** file (`index.ts`) at the appropriate level.

## Hook Template

```ts
import { useState, useCallback } from 'react';

interface Use[Name]Options {
  // configuration options
}

interface Use[Name]Return {
  // return type definition
}

export function use[Name](options?: Use[Name]Options): Use[Name]Return {
  // hook implementation

  return {
    // return values
  };
}
```

## Test Template

```ts
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { use[Name] } from './use[Name]';

describe('use[Name]', () => {
  it('returns initial state', () => {
    const { result } = renderHook(() => use[Name]());
    expect(result.current).toBeDefined();
  });

  it('handles state updates', () => {
    const { result } = renderHook(() => use[Name]());
    act(() => {
      // trigger state change
    });
    // assert new state
  });
});
```

## Rules

- Hook names must start with `use` prefix.
- Always define an explicit return type.
- Keep hooks focused on a single concern.
- Hooks in the `application/` layer should not import from `presentation/`.
- Domain logic should stay in the `domain/` layer, not in hooks.
