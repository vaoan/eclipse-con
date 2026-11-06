# Portability

## Path Aliases

Use the `@/` path alias for imports beyond one level of relative depth. This keeps imports stable when files move.

```ts
// Correct — alias for anything beyond ../
import { UserCard } from "@/features/user/presentation/components/UserCard";
import { environment } from "@/shared/infrastructure/config/environment";

// Acceptable — one level up
import { useUserCard } from "../hooks/useUserCard";

// Wrong — deep relative paths
import { UserCard } from "../../../../features/user/presentation/components/UserCard";
```

## Environment Variables

All environment variables are accessed through `environment.ts`. No module should read `import.meta.env` directly.

```ts
// Correct
import { environment } from "@/shared/infrastructure/config/environment";
const url = environment.apiBaseUrl;

// Wrong
const url = import.meta.env.VITE_API_BASE_URL;
```

## No Platform-Specific Code

Avoid browser-specific or OS-specific APIs without an abstraction layer. If platform-specific code is needed, wrap it behind an interface in the infrastructure layer.

## Use pnpm Exclusively

This project uses **pnpm** as its package manager. Do not use npm or yarn.

```bash
pnpm install      # Install dependencies
pnpm add <pkg>    # Add a dependency
pnpm dev          # Start dev server
pnpm build        # Production build
```

Do not commit `package-lock.json` or `yarn.lock`. Only `pnpm-lock.yaml` should exist.
