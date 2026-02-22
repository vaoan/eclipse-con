# Create API Integration

Skill for creating an API integration following Clean Architecture layers. This serves as the pattern for future API service integrations.

## Steps

1. **Create service in feature's `infrastructure/` layer**:
   - File: `src/features/[feature]/infrastructure/[name]Service.ts`
   - Implement the repository interface defined in domain.
   - Handle HTTP requests using fetch or a configured HTTP client.
   - Map API responses to domain types.

   ```ts
   import type { [Entity]Repository } from '../domain/[entity]Repository';
   import type { [Entity] } from '../domain/types';

   const API_URL = import.meta.env.VITE_[FEATURE]_API_URL;

   export function create[Entity]Service(): [Entity]Repository {
     return {
       async getAll(): Promise<[Entity][]> {
         const response = await fetch(`${API_URL}/[entities]`);
         if (!response.ok) throw new Error('Failed to fetch [entities]');
         return response.json();
       },

       async getById(id: string): Promise<[Entity]> {
         const response = await fetch(`${API_URL}/[entities]/${id}`);
         if (!response.ok) throw new Error('[Entity] not found');
         return response.json();
       },
     };
   }
   ```

2. **Define types in feature's `domain/` layer**:
   - Entity types: `src/features/[feature]/domain/types.ts`
   - Repository interface: `src/features/[feature]/domain/[entity]Repository.ts`

   ```ts
   // types.ts
   export interface [Entity] {
     id: string;
     // ... entity properties
   }

   // [entity]Repository.ts
   import type { [Entity] } from './types';

   export interface [Entity]Repository {
     getAll(): Promise<[Entity][]>;
     getById(id: string): Promise<[Entity]>;
   }
   ```

3. **Create custom hook in feature's `application/` layer**:
   - File: `src/features/[feature]/application/use[Entity].ts`
   - Manage loading, error, and success states.
   - Expose data and operations to the presentation layer.

   ```ts
   import { useState, useEffect, useCallback } from 'react';
   import type { [Entity] } from '../domain/types';
   import type { [Entity]Repository } from '../domain/[entity]Repository';

   interface Use[Entity]Return {
     data: [Entity][] | null;
     isLoading: boolean;
     error: string | null;
     refetch: () => void;
   }

   export function use[Entity](repository: [Entity]Repository): Use[Entity]Return {
     const [data, setData] = useState<[Entity][] | null>(null);
     const [isLoading, setIsLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);

     const fetch = useCallback(async () => {
       setIsLoading(true);
       setError(null);
       try {
         const result = await repository.getAll();
         setData(result);
       } catch (err) {
         setError(err instanceof Error ? err.message : 'Unknown error');
       } finally {
         setIsLoading(false);
       }
     }, [repository]);

     useEffect(() => {
       fetch();
     }, [fetch]);

     return { data, isLoading, error, refetch: fetch };
   }
   ```

4. **Handle loading, error, and success states** in the presentation layer:
   - Show a loading indicator while data is being fetched.
   - Display error messages when requests fail.
   - Render the data on success.
   - Provide retry functionality on error.

5. **Add environment variable for API URL**:
   - Add `VITE_[FEATURE]_API_URL` to `.env.example` with a placeholder value.
   - Document the variable in the project README or configuration docs.
   - Never commit actual API URLs or keys to the repository.

## Architecture Flow

```
Presentation (component) -> Application (hook) -> Domain (interface) <- Infrastructure (service)
```

- Presentation calls the hook.
- Hook uses the repository interface (dependency injection).
- Infrastructure implements the repository interface with actual HTTP calls.
- Domain defines the types and contracts.

## Rules

- Infrastructure must not be imported directly by presentation.
- Domain layer has zero external dependencies.
- API URLs come from environment variables, never hardcoded.
- All API errors must be caught and handled gracefully.
- Repository interfaces live in domain, implementations in infrastructure.
