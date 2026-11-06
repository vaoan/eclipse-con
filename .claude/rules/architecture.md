---
paths:
  - "apps/moonfest2026/src/features/**"
  - "apps/moonfest2026/src/shared/**"
  - "apps/moonfest2026/src/app/**"
---

# Clean Architecture (Moonfest 2026 only)

Loaded when Moonfest source is read. Moonfest is archived but still built. **Sunfest 2027 and Links are deliberately flat: do not restructure them into feature modules.** Each line is the rule; the link is the full text.

- **Lay each feature out as `src/features/[name]/{domain,application,infrastructure,presentation}` plus an `index.ts` barrel.** → `docs/lessons/architecture.md` (Feature-Based Module Structure)
- **Dependencies point inward only**: presentation to application to domain, infrastructure to application to domain. `domain/` imports no other layer, `application/` imports only `domain/`. → `docs/lessons/architecture.md` (Dependency Rule)
- **Never import `presentation/` or `infrastructure/` from `domain/` or `application/`.** → `docs/lessons/architecture.md` (Dependency Rule)
- **Features never import another feature's internals**; consume its public API through `index.ts`, never an internal path. → `docs/lessons/architecture.md` (Barrel Exports)
- **App-wide code in `src/shared/` follows the same four layers**; `src/app/` holds providers, router and layouts. → `docs/lessons/architecture.md` (Shared Code, App Shell)
- **Treat Moonfest as read-only maintenance**: add no features to it unasked, and do not port its structure onto Sunfest. → `CLAUDE.md`
