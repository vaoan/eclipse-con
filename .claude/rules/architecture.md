# Clean Architecture for SPA

## Feature-Based Module Structure

Each feature lives under `src/features/[name]/` with four layers:

```
src/features/[name]/
  domain/          # Entities, value objects, repository interfaces
  application/     # Use cases, DTOs, port interfaces
  infrastructure/  # API clients, adapters, repository implementations
  presentation/    # Components, hooks, pages
  index.ts         # Barrel export (public API of the feature)
```

## Dependency Rule

Dependencies flow **inward only**:

```
presentation → application → domain
infrastructure → application → domain
```

- `domain/` has zero internal imports from other layers.
- `application/` imports only from `domain/`.
- `presentation/` imports from `application/` and `domain/`.
- `infrastructure/` implements interfaces defined in `application/` or `domain/`.

Never import from `presentation/` or `infrastructure/` inside `domain/` or `application/`.

## Shared Code

Shared code follows the same layer structure:

```
src/shared/
  domain/          # Shared entities, value objects
  application/     # Shared use cases, ports
  infrastructure/  # Shared adapters (i18n, HTTP client, storage)
  presentation/    # Shared UI components, hooks, layouts
```

## App Shell

```
src/app/
  providers/       # Context providers, dependency injection
  router/          # Route definitions, guards
  layouts/         # App-level layout components
```

## Barrel Exports

Every feature exposes its public API through `index.ts`:

```ts
// src/features/auth/index.ts
export { LoginPage } from "./presentation/pages/LoginPage";
export type { User } from "./domain/entities/User";
```

Consumers import from the barrel, never from internal paths.
