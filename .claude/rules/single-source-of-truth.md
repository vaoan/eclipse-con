# Single Source of Truth

## Principle

Each piece of data, configuration, or logic should have **exactly one authoritative source** in the codebase. All other usages must reference or derive from that source.

## Derive, Don't Duplicate

If a value can be computed from existing data, compute it. Do not store a second copy.

```ts
// Wrong — duplicated state
const [items, setItems] = useState<Item[]>([]);
const [itemCount, setItemCount] = useState(0);

// Correct — derived value
const [items, setItems] = useState<Item[]>([]);
const itemCount = items.length;
```

## Types from the Domain Layer

Shared types and interfaces are defined in the `domain/` layer and imported by all other layers. Do not redefine the same shape in multiple places.

```ts
// Define once in domain
// src/features/auth/domain/entities/User.ts
export interface User { ... }

// Import everywhere else
import type { User } from '@/features/auth';
```

## Configuration from environment.ts

All runtime configuration (API URLs, feature flags, third-party keys) must come from a single `environment.ts` file. No module should read `import.meta.env` directly.

```ts
// src/shared/infrastructure/config/environment.ts
export const environment = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  featureFlags: { ... },
} as const;
```

## Constants

Shared constants live in the domain or application layer of the relevant feature. If used across features, they belong in `src/shared/domain/constants/`.
