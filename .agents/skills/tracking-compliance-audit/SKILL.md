---
name: tracking-compliance-audit
description: Audit product analytics and consent compliance. Use when updating tracking events, consent UX/copy, privacy safeguards, or README/privacy documentation.
---

# Tracking Compliance Audit

## Overview

This skill performs a repeatable compliance audit for first-party web analytics:

1. Inventory what is actually tracked.
2. Verify which events are gated by consent.
3. Discover missing tracking opportunities from product copy and UX flow context.
4. Classify each current and proposed signal into explicit consent flags.
5. Align consent popup language with real implementation.
6. Update README with both "what we track" and "why we track it".
7. Validate with lint/typecheck/format checks.

Use this when:

- adding/changing analytics events
- changing consent logic or consent copy
- preparing privacy/compliance documentation
- reviewing whether docs match runtime behavior

## Workflow

### Step 1: Inventory tracked events from source of truth

Read:

- `src/shared/infrastructure/analytics/trackingSchema.ts`
- `src/shared/infrastructure/analytics/extremeTracking.ts`
- `src/shared/infrastructure/analytics/trackingCustomEvents.ts`
- `src/shared/infrastructure/analytics/trackingPrivacy.ts`

Extract:

- event names emitted in runtime (`track(context, "...")`)
- payload keys allowed by `EVENT_DATA_ALLOWLIST`
- sanitation rules (path/query sanitization, key/value filters)

### Step 2: Verify consent gating behavior

Read:

- `src/shared/infrastructure/analytics/consent.ts`
- `src/app/providers/TrackingConsentGate.tsx`
- analytics gating code (`ANALYTICS_ONLY_EVENTS`, `analyticsConsentGranted`)

Confirm explicitly:

- which categories are persisted
- which categories are actively enforced in runtime
- whether popup text claims match actual enforcement

### Step 3: Align popup copy with reality

Update:

- `src/shared/infrastructure/i18n/locales/en.json`
- `src/shared/infrastructure/i18n/locales/es.json`
- `src/app/providers/TrackingConsentGate.tsx` (if scope notes or labels are missing)

Rules:

- never claim tracking categories are enforced if they are only stored
- state if third-party ad tags are not active
- keep "necessary always on" clearly visible

### Step 3: Discover tracking opportunities from copy/context

Read product copy and flow context:

- `src/shared/infrastructure/i18n/locales/en.json`
- `src/shared/infrastructure/i18n/locales/es.json`
- high-impact UX sections/pages where conversions happen
- CTA/funnel metadata in rendered components (`data-*` instrumentation attributes)

Use this context to find missing opportunities, for example:

- confusion points in reservation + ticket sequence
- FAQ intents that indicate purchase blockers
- drop-off points between section visibility and CTA click
- language-toggle behavior around consent and conversion surfaces

For each opportunity, propose:

- `event_name` (snake_case)
- trigger source (UI interaction, visibility, form, route transition)
- safe payload keys (allowlist-ready, no raw PII)
- business reason ("why this helps decisions")
- expected owner (growth/product/ops/engineering)

### Step 4: Classify signals into consent flags

Every current and proposed event must map to a consent flag:

- `necessary`: reliability, security, essential diagnostics
- `analytics`: behavioral and UX performance measurement
- `personalization_future`: reserved for future preference/content tailoring
- `advertising_future`: reserved for future campaign/ad measurement

Output a table with:

- `event_name`
- `current_or_proposed` (`current` | `proposed`)
- `consent_flag`
- `justification`
- `sensitivity_level` (`low` | `medium` | `high`)

If a proposed event requires a new flag, mark as `new_flag_required` and describe migration impact.

### Step 5: Align popup copy with reality

Update:

- `src/shared/infrastructure/i18n/locales/en.json`
- `src/shared/infrastructure/i18n/locales/es.json`
- `src/app/providers/TrackingConsentGate.tsx` (if scope notes or labels are missing)

Rules:

- never claim tracking categories are enforced if they are only stored
- state if third-party ad tags are not active
- keep "necessary always on" clearly visible
- if future flags are introduced, label them as future/inactive until enforced

### Step 6: Update README with "what + why"

Update `README.md` with:

- data minimization controls
- consent model scope
- grouped event list (necessary vs optional)
- explicit purpose for each group (operations, reliability, UX, conversion)

Do not add unverifiable claims. Documentation must reflect current code.

### Step 7: Validate

Run:

```bash
pnpm typecheck
pnpm lint
pnpm prettier --check README.md src/app/providers/TrackingConsentGate.tsx src/shared/infrastructure/i18n/locales/en.json src/shared/infrastructure/i18n/locales/es.json
```

If any command fails, fix and rerun until clean.

## Output checklist

- Consent popup text matches implemented gating.
- README includes reasons for tracked categories.
- Event and payload docs reflect `trackingSchema.ts`.
- Opportunity analysis uses product copy and real UX flows as input.
- Current + proposed events are classified into consent flags.
- All checks pass.
