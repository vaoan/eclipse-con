# DRY Principle

**Don't Repeat Yourself** — every piece of knowledge should have a single, unambiguous representation in the codebase.

## Extract Shared Logic

- Repeated logic across components belongs in a custom hook (`src/shared/application/hooks/` or feature-level hooks).
- Repeated utility functions belong in `src/shared/application/utils/` or `src/shared/domain/`.

## Shared Types

Define types in the domain layer and import them everywhere. Never redefine the same shape in multiple files.

## Shared UI Components

Reusable UI elements (buttons, inputs, modals, cards) belong in `src/shared/presentation/components/`.

## The Rule of Three

Do **not** over-abstract prematurely. Apply DRY extraction after **three occurrences** of the same pattern:

1. **First occurrence** — write it inline.
2. **Second occurrence** — note the duplication but leave it.
3. **Third occurrence** — extract into a shared abstraction.

This avoids creating abstractions that only serve one or two cases and may not generalize well.

## What DRY Is Not

DRY does not mean "identical code must always be merged." Two pieces of code that look the same but serve different purposes and change for different reasons should remain separate. DRY is about **knowledge duplication**, not **code duplication**.
