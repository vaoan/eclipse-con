# Eclipse Con / Moonfest 2026

<div align="center">

`Moonfest 2026 • official event website • bilingual static-first SPA`

[Live site](https://filedn.com/leGgCrrYIXV0YvzNNKbdzBb/index.html)

[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=61dafb&labelColor=0b1020)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=3178c6&labelColor=0b1020)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646cff?style=flat-square&logo=vite&logoColor=646cff&labelColor=0b1020)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-06b6d4?style=flat-square&logo=tailwindcss&logoColor=06b6d4&labelColor=0b1020)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-4-6e9f18?style=flat-square&logo=vitest&logoColor=6e9f18&labelColor=0b1020)](https://vitest.dev/)

</div>

## What This Repo Is

This repository contains the official Moonfest 2026 website: a bilingual React SPA for a four-day furry convention in Paipa, Boyaca, Colombia, scheduled for **July 10 to July 13, 2026**.

The product is designed around one core constraint:

- It must work as a polished modern web app during development.
- It must also ship as a **self-contained static artifact** for simple hosting and archival deployment.

That requirement shapes nearly everything in this codebase: hash-based routing, aggressive asset inlining, embedded Telegram content, and environment-driven runtime configuration.

## Site Analysis

The current site is not a generic landing page. It is a structured event operations surface with strong editorial presentation.

### Information architecture

The main convention experience is a single long-form page composed in this order:

1. Hero
2. About / positioning
3. Activities and event framing
4. Reservation packages
5. Ticketing
6. Venue
7. Hotel amenities and paid extras
8. Travel guidance
9. Telegram news feed
10. Organizers
11. FAQ
12. Footer

There is also a separate `#/registration-tutorial` route for the two-step booking flow.

### Product goals the site is serving

- Sell the atmosphere of Moonfest as a destination event.
- Explain the reservation model clearly enough to reduce attendee confusion.
- Present hotel, pricing, and travel logistics with enough detail to support purchase decisions.
- Keep event communications fresh through Telegram-fed updates.
- Give the organizers a visible public face.
- Preserve privacy by keeping analytics consent-gated and disabled by default.

### What makes the site distinctive

- A dramatic layered visual composition with a sticky hero, starfield sky, sakura particles, and overlapping post-hero content.
- A strong destination-driven content model: venue, thermal amenities, transport, weather, and hotel extras are first-class content, not side notes.
- A multilingual editorial/news layer powered by Telegram exports and translated archives.
- A static build pipeline that inlines external fonts, icons, images, and embedded content into a portable deliverable.

### UX patterns already present in the code

- Section-aware URL syncing for deep-linking into the long landing page.
- Hash routing for static deployment compatibility.
- i18n-first UI strings through `react-i18next`.
- Consent-gated analytics with necessary vs optional tracking categories.
- Registration guidance split into a dedicated step-by-step tutorial instead of forcing everything into the landing page.

## Main User Journeys

### Landing-page visitor

The primary visitor path is:

`Hero -> Why Moonfest -> What is included -> Reservation pricing -> Venue confidence -> FAQ`

That path is optimized for conversion and reassurance.

### Attendee needing operational detail

This path is more logistics-heavy:

`Venue -> Amenities -> Travel tips -> News -> FAQ -> Reservation tutorial`

This is where the site behaves more like an event handbook than a promo page.

### Returning community member

Returning users are likely checking:

- new Telegram updates
- organizer changes
- package details
- venue and transport reminders

That makes the embedded news archive and section deep-linking materially important.

## Feature Map

### Convention landing page

- Hero with branding, event dates, and primary reservation CTA
- About section explaining the event identity and 2026 location shift
- Activities and “what’s included” framing
- Reservation packages with room-based pricing
- Ticketing placeholder flow
- Official venue presentation for Hotel Estelar Paipa
- Amenity cards for spa, thermal waters, restaurants, nautical activities, farm, horses, bikes, tennis, pet hotel, and more
- Travel advice with weather, local attractions, and destination context
- Organizer roster
- FAQ

### Registration tutorial route

- Three-step explanation of the booking model
- Explicit separation between hotel reservation and event ticket purchase
- Interactive completion checklist
- Analytics hooks for tutorial progress tracking

### News system

- Telegram archive stored in `public/telegram/`
- Spanish source feed plus English translated feed
- Many alternate visual renderers for the news section
- Static embedding support so the single-file build does not depend on live requests

### Analytics and consent

- Necessary and analytics categories
- Local consent storage
- Optional outbound event delivery
- Sanitized event payloads, allowlists, and privacy filters
- Disabled by default unless explicitly enabled through env overrides

## Technical Architecture

The project uses a Clean Architecture-inspired feature layout.

```text
src/
  app/
    layouts/
    providers/
    router.tsx
  features/
    analytics/
    convention/
    registration-tutorial/
  shared/
    application/
    domain/
    infrastructure/
    presentation/
  test/
public/
scripts/
```

### Architectural conventions

- `src/app/` owns shell concerns such as routing, providers, and layouts.
- `src/features/<feature>/` contains `domain`, `application`, `infrastructure`, and `presentation`.
- `src/shared/` contains cross-feature code using the same layer split.
- UI strings live in locale JSON files and are accessed through translation keys.
- Imports use the `@/*` alias to `src/*`.

## Routing and Delivery Model

The application uses `createHashRouter`, not browser history routing.

This is intentional. The project is built to survive:

- static hosting
- local file distribution
- artifact-style deployments

Current top-level routes:

- `#/` for the main convention page
- `#/registration-tutorial` for the booking walkthrough

## Static Build Strategy

`pnpm build:static` is one of the defining workflows in this repo.

The static pipeline:

- builds the app with Vite
- prepares a static public directory
- optimizes Telegram media assets
- embeds Telegram archives for static consumption
- inlines external fonts and asset URLs into the generated output
- deduplicates repeated data URIs
- emits a portable static artifact in `dist-static/`

This is why the project can behave like a rich SPA while still shipping as a nearly self-contained deliverable.

## Content Sources

The site mixes authored content, structured local data, and curated external references.

### Local product content

- convention copy in `src/shared/infrastructure/i18n/locales/`
- organizer cards in `src/features/convention/application/data/guests.ts`
- navigation definitions in `src/features/convention/application/data/navigation.ts`

### Generated content

- Telegram exports in `public/telegram/messages.json`
- translated Telegram feed in `public/telegram/messages.en.json`

### External sources referenced by the site

- Hotel Estelar Paipa official pages and PDFs
- weather and travel sources
- Telegram community links
- social platforms linked in the footer

## Environment Model

Safe defaults live in `.env.example`.

Use `.env.local` or `.env.development` for local overrides and secrets. Both are gitignored.

Important current rules:

- analytics are **off by default**
- analytics keys should not live in `.env.example`
- `VITE_APP_VERSION` is stored in `.env.example`
- the pre-commit version bump updates `.env.example`
- static build scripts read the version from `.env.example`

### Relevant variables

| Variable                      | Purpose                                |
| ----------------------------- | -------------------------------------- |
| `VITE_APP_NAME`               | App display name                       |
| `VITE_DEFAULT_LOCALE`         | Fallback locale                        |
| `VITE_SUPPORTED_LOCALES`      | Comma-separated locale list            |
| `VITE_DEBUG`                  | Debug-mode toggle                      |
| `VITE_APP_VERSION`            | Build/version label used in the footer |
| `VITE_ANALYTICS_ENABLED`      | Master analytics switch                |
| `VITE_ANALYTICS_ENDPOINT`     | Optional custom ingest endpoint        |
| `VITE_POSTHOG_API_KEY`        | Optional PostHog project key           |
| `VITE_POSTHOG_HOST`           | Optional PostHog host                  |
| `VITE_CF_WEB_ANALYTICS_TOKEN` | Optional Cloudflare token              |

## Local Development

```bash
pnpm install
pnpm dev
```

Dev server default:

- `http://localhost:5173`

Primary scripts:

```bash
pnpm dev
pnpm build
pnpm build:static
pnpm preview
pnpm typecheck
pnpm lint
pnpm format
pnpm format:check
pnpm test
pnpm test:watch
pnpm test:coverage
pnpm test:e2e
```

## Telegram Workflows

Telegram content is part of the site, not an afterthought.

Use these scripts when updating the news archive:

```bash
pnpm fetch:telegram
pnpm translate:telegram
pnpm sync:telegram
```

These depend on local credentials configured outside the tracked env example.

## Quality Gates

Before committing, the expected baseline is:

```bash
pnpm typecheck && pnpm lint && pnpm build
```

The repo also uses Husky and `lint-staged` to enforce checks during commit.

## Testing

### Unit testing

- Vitest
- Testing Library
- colocated `*.test.ts` / `*.test.tsx` files where practical

### End-to-end testing

- Playwright
- accessibility coverage through `@axe-core/playwright`

## Repository Guidelines

### Naming and style

- TypeScript strict mode
- function components only
- PascalCase for components and types
- camelCase for hooks and utilities
- kebab-case for config files
- prefer `import type`

### Translation discipline

- UI strings should go through `useTranslation()`
- use dot-notation translation keys
- avoid hardcoded user-facing strings in components

## Where to Look First

If you are new to the repo, start here:

- `src/features/convention/presentation/ConventionPage.tsx`
- `src/features/convention/application/data/navigation.ts`
- `src/shared/infrastructure/i18n/locales/en.json`
- `src/shared/infrastructure/config/environment.ts`
- `vite.config.ts`
- `scripts/build-static.mjs`

That set gives you the product shape, content model, runtime config, and deployment model fast.

## Current Reality of the Product

This repo is best understood as a hybrid of:

- destination-event marketing site
- attendee logistics handbook
- community news surface
- privacy-conscious static web artifact

That combination is what makes it unusual. If you change the README, the build model, or the content structure later, preserve that framing. It is the real identity of the project.
