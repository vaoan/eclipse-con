---
paths:
  - "scripts/**"
  - ".github/workflows/**"
  - ".husky/**"
  - "apps/*/scripts/**"
---

# Build Checks

Loaded when a script, workflow or hook is read. The checks to run before calling work finished are in `CLAUDE.md`, always loaded. Each line is the rule; the link is the full text.

- **Before a commit, `pnpm typecheck`, `pnpm lint` and `pnpm build` must all pass with zero errors.** → `docs/lessons/build-checks.md` (Before Committing)
- **CI runs typecheck, lint, test, then build, and a failure at any stage blocks the later ones.** Keep a changed script or workflow consistent with that order. → `docs/lessons/build-checks.md` (CI Pipeline Order)
- **Run the whole suite before pushing**, using the single checks for quick iteration. → `docs/lessons/build-checks.md` (Quick Feedback Loop)
- **`.github/workflows/deploy-sunfest.yml` deploys Sunfest on every push to `main` unless only ignored paths changed** (`apps/moonfest2026/**`, `apps/links/**`, `packages/**`, `docs/**`, `publicity/**`, `**/*.md`): keep its `paths-ignore` in step with the layout. → `docs/lessons/project-overview.md` (Deployment)
