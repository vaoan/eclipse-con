# Furry Colombia Events — Sunfest 2027

<div align="center">

`Sunfest 2027 • official event website • bilingual single-file SPA`

[Live site](https://sunfest.furrycolombia.com/)

[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=61dafb&labelColor=0b1020)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=3178c6&labelColor=0b1020)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646cff?style=flat-square&logo=vite&logoColor=646cff&labelColor=0b1020)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-06b6d4?style=flat-square&logo=tailwindcss&logoColor=06b6d4&labelColor=0b1020)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-4-6e9f18?style=flat-square&logo=vitest&logoColor=6e9f18&labelColor=0b1020)](https://vitest.dev/)

</div>

## What This Repo Is

A pnpm workspace holding the Furry Colombia event sites.

**Moonfest 2026 is over.** Sunfest 2027 is the active product, and every
unsuffixed command in this repo (`pnpm dev`, `pnpm build`, `pnpm test`) targets
it. Moonfest 2026 is kept in the workspace, still builds, and still deploys —
but as an archive, behind `:moonfest`-suffixed scripts. Its full documentation
is preserved in [Archive: Moonfest 2026](#archive-moonfest-2026) at the end of
this file.

```text
apps/
├── sunfest2027/        ACTIVE    → sunfest.furrycolombia.com
└── moonfest2026/       ARCHIVED  → moonfest.furrycolombia.com
packages/
└── telegram-sync/      Telegram → site news sync (moonfest2026 only)
cloudflare/             sunfest-worker.mjs — the Sunfest asset worker
docs/superpowers/       Dated design specs and implementation plans
scripts/                Workspace tooling (sync-secrets.mjs, make-qr.mjs)
publicity/              Print assets: sunfest2027 QR code + the logo it embeds
```

| App          | Host                            | Wrangler config                   | Status                       |
| ------------ | ------------------------------- | --------------------------------- | ---------------------------- |
| sunfest2027  | `sunfest.furrycolombia.com`     | `wrangler.sunfest.toml`           | Active                       |
| sunfest2027  | `sunfest2027.furrycolombia.com` | `apps/moonfest2026/wrangler.toml` | 302 → `sunfest.` (publicity) |
| moonfest2026 | `moonfest.furrycolombia.com`    | `apps/moonfest2026/wrangler.toml` | Archived                     |

---

# Sunfest 2027

The official site for Sunfest 2027 — a Furry Colombia gathering at Hotel Mocawa
Resort in La Tebaida, Quindío, framed around Colombia's carnival traditions. It
is a bilingual (es/en) single scrolling page.

## What It Is Built Like

Sunfest is deliberately much simpler than Moonfest was. It is one page, so it
carries none of the routing, feature-module, or environment machinery that the
Moonfest app needed:

- **No router.** One scrolling page composed in `App.tsx`.
- **No environment variables.** Nothing to configure at build or run time.
- **No analytics runtime.** Interactive elements still carry `data-content-*` / `data-cta-*` attributes so tracking can be added without touching markup.
- **No Telegram sync and no E2E suite.**
- **Single-file output.** `vite-plugin-singlefile` inlines every script, style, and asset, so `dist/index.html` is the whole site.

## Structure

```text
apps/sunfest2027/src/
├── App.tsx           # Composes the sections in scroll order
├── main.tsx          # Entry point
├── index.css         # All styling: @theme tokens + hand-written CSS
├── sections/         # One file per full-screen section (+ colocated tests)
│   ├── Hero.tsx
│   ├── Recap.tsx
│   ├── HotelShowcase.tsx
│   ├── WhatIsSunfest.tsx
│   ├── Amenities.tsx
│   ├── CtaBand.tsx
│   └── SiteFooter.tsx
├── components/       # Reusable pieces (Lightbox, FlagMarquee, cards, toggles)
├── lib/              # Hooks and utils (cn, tid, useScrollReveal, …)
├── locales/          # en.json, es.json
├── assets/           # Imported images (hero, showcase, flags)
└── *.ts              # Content constants (showcase, carnaval, flags, socials)
```

### Page order

1. **Hero** — the Sunfest illustration full-bleed, with wordmark, slogan and the Telegram CTA
2. **Recap** — thank-you for Moonfest 2026, attendee count and a moving flag line of participating countries
3. **HotelShowcase** — the giant pool as the money shot, then the room types
4. **WhatIsSunfest** — a short intro to the event
5. **Amenities** — venue amenity cards plus an overflow list
6. **CtaBand** — the closing "more to come" promise and follow CTA
7. **SiteFooter** — socials row and copyright

`<GarlandDivider />` separates each section.

### Section rhythm

Every `.section` has `min-height: var(--section-min-h)` (`100svh`) and centres
its content vertically, so each section owns a full screen and reads as its own
beat. This is a **floor, not a fixed height** — sections whose content exceeds
the viewport (the showcase and amenities grids) simply grow past it. `svh` is
used rather than `dvh` so mobile browser chrome sliding in and out does not
re-centre content mid-scroll.

### Styling

All styling is hand-written CSS in `src/index.css`, not Tailwind utilities in
JSX. Colours come from the `@theme` tokens at the top of that file — the
official Sunfest carnaval palette:

| Token             | Role                     |
| ----------------- | ------------------------ |
| `--color-yellow`  | Headings, wordmark       |
| `--color-magenta` | Carnaval accent          |
| `--color-purple`  | Ground / background base |
| `--color-teal`    | Eyebrows, garland        |
| `--color-cream`   | Body text                |
| `--color-ink`     | Dark text on light       |

Add a token rather than a literal colour.

### Motion and accessibility

- Sections reveal on scroll via `useScrollReveal()` (IntersectionObserver).
- `usePrefersReducedMotion()` gates the falling-flower shower, confetti, marquee, and reveal transitions; reduced motion reveals content immediately rather than hiding it.
- The flower shower also has a manual toggle (`FlowerToggle`).
- The lightbox is keyboard-navigable (`useLightboxKeyboard`).

## Local Development

```bash
pnpm install
pnpm dev            # http://localhost:5173
```

Primary scripts:

```bash
pnpm dev              # Vite dev server
pnpm build            # tsc -b + vite build → dist/index.html (single file)
pnpm build:static     # Same build, emitted to dist-static/
pnpm preview          # Serve the production build
pnpm typecheck        # TypeScript only
pnpm test             # Vitest
pnpm deploy:sunfest   # Build + wrangler deploy
```

Workspace-wide:

```bash
pnpm lint             # ESLint
pnpm format           # Prettier (write)
pnpm format:check     # Prettier (check only)
pnpm check:style      # Stylelint across all apps
pnpm check:tools      # cspell + knip + jscpd + ls-lint
pnpm sync:secrets     # Pull repository secrets into .secrets
```

## Deployment

Sunfest is served by a Cloudflare Worker that serves the built assets.

- Worker entry: `cloudflare/sunfest-worker.mjs`
- Config: `wrangler.sunfest.toml` (repo root)
- Assets directory: `apps/sunfest2027/dist`
- Custom domain: `sunfest.furrycolombia.com`; no `*.workers.dev` URL is exposed
- `not_found_handling = "single-page-application"`

### The year-stamped publicity host

Posters, flyers and social posts link to **`sunfest2027.furrycolombia.com`**,
not to `sunfest.furrycolombia.com`. Today that host is a Custom Domain on the
`eclipse-con` Worker (`apps/moonfest2026/wrangler.toml`), which answers with a
**302** to `sunfest.furrycolombia.com`, keeping the path and any campaign query
string. It is a 302 on purpose: a 301 would be cached by browsers for good, and
after the archive swap those visitors would land on the next event instead.

When Sunfest 2027 concludes, detach that host from `eclipse-con`, archive the
site on its own assets-only Worker at `sunfest2027.furrycolombia.com`, and
point `sunfest.furrycolombia.com` at the next event — the printed links keep
working and stay frozen on the 2027 edition, exactly as
`moonfest2026.furrycolombia.com` does for Moonfest.

The redirect ships with the `eclipse-con` Worker, so a change to it deploys
with `pnpm deploy:cloudflare:moonfest` (there is no GitHub workflow for that
Worker).

The QR code for print lives at `publicity/sunfest2027-qr.png` and encodes that
host with the Furry Colombia logo in the centre. Regenerate it with
`pnpm qr:sunfest2027`. For print, `pnpm qr:sunfest2027:print` writes
`publicity/sunfest2027-qr-50mm.svg` (vector modules, exactly 50 mm wide, the
one to hand to a print shop) and `publicity/sunfest2027-qr-50mm.png` (600 dpi,
tagged to open at 50 mm). 50 mm is the smallest size at which the logo is still
recognisable; the code scans from about 50 cm at that size. `scripts/make-qr.mjs`
takes `--url`, `--logo`, `--ec`, `--out`, `--size`, `--mm` and `--logo-scale`
if you need another code, size or logo. Never crop the white border: it is the
quiet zone the scanner needs.

When space is tight, `pnpm qr:sunfest2027:plain` writes a logo-free 30 mm
version (`publicity/sunfest2027-qr-30mm-plain.svg` and `.png`). Without a logo
the code drops to error-correction level M, which makes it 29 modules instead
of 37, and 30 mm is the smallest width that scans reliably from 30 cm. Do not
go below it.

Deploy locally:

```bash
pnpm deploy:sunfest
```

Or run the **Deploy Sunfest** GitHub Actions workflow
(`.github/workflows/deploy-sunfest.yml`), which builds and deploys using the
`CLOUDFLARE_API_TOKEN` repository secret.

## Testing

- Vitest + Testing Library, colocated `*.test.tsx` next to each section and component.
- `copy.test.ts` and `i18n-parity.test.ts` assert that every translation key exists in both `es` and `en`.
- **Tests assert i18n keys, not translated copy.** `t()` is mocked to return its key, so a test names `about.title`, never the wording. See `.claude/rules/i18n-testing.md`.

## Quality Gates

```bash
pnpm typecheck && pnpm lint && pnpm build
```

Husky runs `pnpm precommit` (lint-staged) on commit. It no longer bumps a
version number — Moonfest's version bump is manual now
(`pnpm version:auto:moonfest`).

## Adding a Section

1. Create `src/sections/[Name].tsx` and `[Name].test.tsx`.
2. Root element: `className={cn("section", "section-[name]", revealed && "is-revealed")}`, wired to `useScrollReveal()`.
3. Add `data-content-section` and `data-testid={tid("[name]")}`.
4. Put new styles in `index.css` using the existing `@theme` tokens.
5. Add keys to `src/locales/en.json` and `es.json`.
6. Compose into `src/App.tsx` in scroll order, with a `<GarlandDivider />` before it.

## Where to Look First

- `apps/sunfest2027/src/App.tsx` — the whole page in one file
- `apps/sunfest2027/src/index.css` — tokens and every style
- `apps/sunfest2027/src/locales/en.json` — all copy
- `apps/sunfest2027/src/showcase.ts` — resort and amenity content
- `wrangler.sunfest.toml` — the deployment model

---

# Archive: Moonfest 2026

> **Moonfest 2026 has concluded** (it ran July 10–13, 2026 in Paipa, Boyacá).
> The app in `apps/moonfest2026/` is kept buildable and deployable for
> reference and archival, but it is no longer the default target of any
> command and should be treated as read-only maintenance. Everything below
> documents that app as it stands.

All Moonfest commands are suffixed:

```bash
pnpm dev:moonfest
pnpm build:moonfest
pnpm build:static:moonfest
pnpm preview:moonfest
pnpm typecheck:moonfest
pnpm test:moonfest
pnpm test:e2e:moonfest
pnpm deploy:cloudflare:moonfest
pnpm version:auto:moonfest
pnpm sync:telegram:moonfest2026
```

Scripts that only exist inside the app (run them with
`pnpm --filter moonfest2026 <script>`): `release`, `release:staging`,
`deploy:cloudflare:dry-run`, `deploy:cloudflare:staging`,
`test:e2e:routing`, `test:e2e:staging`, `test:e2e:analytics`, `test:watch`,
`test:coverage`, `fetch:telegram`, `translate:telegram`, `telegram:list`,
`telegram:remove`.

## What It Was

The official Moonfest 2026 website: a bilingual React SPA for a four-day furry
convention in Paipa, Boyacá, Colombia, held **July 10 to July 13, 2026**.

The product was designed around one core constraint:

- It must work as a polished modern web app during development.
- It must also ship as a **self-contained static artifact** for simple hosting and archival deployment.

That requirement shaped nearly everything in the app: browser-routing plus
static fallback support, aggressive asset inlining, embedded Telegram content,
and environment-driven runtime configuration.

## Site Analysis

The site is not a generic landing page. It is a structured event operations
surface with strong editorial presentation.

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

There is also a separate `/registration-tutorial` route for the two-step booking flow.

### Product goals the site was serving

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

### UX patterns present in the code

- Section-aware URL syncing for deep-linking into the long landing page.
- Clean browser URLs with Cloudflare SPA fallback for direct deep links.
- i18n-first UI strings through `react-i18next`.
- Consent-gated analytics with necessary vs optional tracking categories.
- Registration guidance split into a dedicated step-by-step tutorial instead of forcing everything into the landing page.

## Main User Journeys

### Landing-page visitor

`Hero -> Why Moonfest -> What is included -> Reservation pricing -> Venue confidence -> FAQ`

That path is optimized for conversion and reassurance.

### Attendee needing operational detail

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
- Activities and "what's included" framing
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
- Lean analytics profile by default so PostHog captures page, funnel, CTA, content, consent, and diagnostics without high-volume clickstream noise
- Cloudflare Web Analytics remains an explicit opt-in
- Google Analytics 4 activates when `VITE_GA_MEASUREMENT_ID` is present unless `VITE_GA_MEASUREMENT_ENABLED=false` is set explicitly
- Google Tag Manager activates when `VITE_GTM_CONTAINER_ID` is present unless `VITE_GTM_ENABLED=false` is set explicitly
- GA4 uses regional consent defaults: analytics starts denied in EEA/UK/CH and granted elsewhere until the visitor updates the consent banner; ads-related storage stays denied everywhere
- High-value analytics events are also mirrored into `window.dataLayer` so GTM can build free GA4 event tags and marketing reports without duplicating low-signal clickstream noise

## Technical Architecture

The app uses a Clean Architecture-inspired feature layout. All paths below are
relative to `apps/moonfest2026/`.

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

The production app uses `createBrowserRouter` with Cloudflare SPA fallback.

This is intentional. The app was built to support:

- direct deep links on the Cloudflare deployment
- static hosting through the Worker asset fallback
- artifact-style deployments via the separate static build flow

Top-level routes:

- `/` for the main convention page
- `/registration-tutorial` for the booking walkthrough

## Static Build Strategy

`pnpm build:static:moonfest` is one of the defining workflows of this app.

The static pipeline:

- builds the app with Vite
- prepares a static public directory
- optimizes Telegram media assets
- embeds Telegram archives for static consumption
- inlines external fonts and asset URLs into the generated output
- deduplicates repeated data URIs
- emits a portable static artifact in `dist-static/`

This is why the app can behave like a rich SPA while still shipping as a nearly
self-contained deliverable.

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

Environment configuration applies to this app only — Sunfest reads no env vars.

Safe defaults live in `apps/moonfest2026/.env.example`.

Use `.env.local` or `.env.development` for local overrides and secrets. Both are gitignored.

For release-specific overrides, the release script also supports:

- `.env.production`
- `.env.production.local`
- `.env.staging`
- `.env.staging.local`

Rules:

- analytics are **off by default**
- analytics keys should not live in `.env.example`
- `VITE_APP_VERSION` is stored in `.env.example`
- static build scripts read the version from `.env.example`
- the version bump is **no longer run by the pre-commit hook** — run `pnpm version:auto:moonfest` by hand if you touch this app

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
| `VITE_GA_MEASUREMENT_ENABLED` | Optional GA4 override, default on      |
| `VITE_GA_MEASUREMENT_ID`      | Optional GA4 measurement ID            |
| `VITE_GTM_ENABLED`            | Optional GTM override, default on      |
| `VITE_GTM_CONTAINER_ID`       | Optional GTM container ID              |
| `VITE_POSTHOG_API_KEY`        | Optional PostHog project key           |
| `VITE_POSTHOG_HOST`           | Optional PostHog host                  |
| `VITE_CF_WEB_ANALYTICS_TOKEN` | Optional Cloudflare token              |

## Telegram Workflows

Telegram content is part of this site, not an afterthought. It is powered by the
workspace package `packages/telegram-sync/`, driven by
`apps/moonfest2026/telegram.config.json`.

```bash
pnpm sync:telegram:moonfest2026              # fetch + translate + deploy
pnpm --filter moonfest2026 fetch:telegram
pnpm --filter moonfest2026 translate:telegram
pnpm --filter moonfest2026 telegram:list
pnpm --filter moonfest2026 telegram:remove
```

These depend on local credentials configured outside the tracked env example.
`translate:telegram` supports `TRANSLATE_PROVIDER=auto`, `codex`,
`claude_code`, `copilot`, `claude`, `openai`, and `azure`. The translator
builds a provider chain from every usable local/API option it can discover and
keeps trying until one succeeds.

## Cloudflare Deployment

The deployment target is a Cloudflare Worker with static assets served from `dist/`.

- Config lives in `apps/moonfest2026/wrangler.toml`
- Build artifact for Cloudflare is `dist/`
- Route is `moonfest.furrycolombia.com/*` (301 → Sunfest since the event concluded)
- Apex domain `furrycolombia.com` is attached as a Worker Custom Domain
- `sunfest2027.furrycolombia.com` is also attached as a Worker Custom Domain (302 → Sunfest; see the Sunfest deployment section)
- Cloudflare SPA fallback handles browser-history routes for direct deep links

Release flow (run from inside the app):

```bash
pnpm --filter moonfest2026 release
pnpm --filter moonfest2026 release:staging
```

Notes:

- `release` loads `.env.example`, then `.env.local`, then `.env.production` and `.env.production.local`, then the current shell env
- `release` auto-commits dirty local changes with `chore: release production`, pushes the current branch to `origin`, then deploys the top-level Wrangler production environment with an explicit empty `--env` target
- `release` promotes project env into Cloudflare too: `VITE_*` keys are sent as Worker vars, and other project keys such as `OPENAI_*`, `AZURE_*`, `TELEGRAM_*`, and `TRANSLATE_*` are uploaded as Worker secrets
- `release:staging` keeps the existing staging safety checks by running the local browser-routing Playwright spec before deploy and the staging browser-routing check after deploy
- `release:staging` loads `.env.example`, then `.env.local`, then `.env.staging` and `.env.staging.local`, then the current shell env
- use `release -- --message="feat: your message"` to override the auto-generated commit message
- use `release -- --dry-run` to run validation plus the Cloudflare dry-run without mutating git state or doing a live deploy
- use `release -- --skip-commit` or `release -- --skip-push` when you only want the deploy orchestration
- `public/robots.txt`, `public/sitemap.xml`, and social metadata in `index.html` all point at the live production domain
- staging uses the separate Worker environment `staging` and the hostname `staging-moonfest.furrycolombia.com`
- the staging hostname must exist in Cloudflare DNS before the Worker route can serve traffic
- `deploy:cloudflare:staging` deploys first and then runs the staging browser-routing E2E against `https://eclipse-con-staging.furrycolombia.workers.dev` by default
- `deploy:cloudflare:staging` also runs the same browser-routing E2E locally before deployment, then reruns it against staging after deployment
- override the E2E target with `PLAYWRIGHT_BASE_URL` if you want to validate the custom staging hostname instead
- `furrycolombia.com` is intentionally configured as a Worker Custom Domain instead of a plain Worker route because that allowed Cloudflare to provision the hostname directly from `wrangler deploy`
- if `furrycolombia.com` appears broken locally while public resolvers already answer it, the usual issue is stale local DNS; test with `nslookup furrycolombia.com 1.1.1.1` or flush the local DNS cache

See also `apps/moonfest2026/CLOUDFLARE-SETUP.md`.

## Testing

### Unit testing

- Vitest
- Testing Library
- colocated `*.test.ts` / `*.test.tsx` files where practical

### End-to-end testing

- Playwright (`pnpm test:e2e:moonfest`)
- accessibility coverage through `@axe-core/playwright`

## Where to Look First

- `src/features/convention/presentation/ConventionPage.tsx`
- `src/features/convention/application/data/navigation.ts`
- `src/shared/infrastructure/i18n/locales/en.json`
- `src/shared/infrastructure/config/environment.ts`
- `vite.config.ts`
- `scripts/build-static.mjs`

That set gives you the product shape, content model, runtime config, and deployment model fast.

## What This App Was

Best understood as a hybrid of:

- destination-event marketing site
- attendee logistics handbook
- community news surface
- privacy-conscious static web artifact

That combination is what made it unusual. If you revisit this app, preserve
that framing — it is its real identity.

---

## Repository Guidelines

Applies to both apps.

### Naming and style

- TypeScript strict mode
- function components only
- PascalCase for components and types
- camelCase for hooks and utilities
- kebab-case for config files
- prefer `import type`
- never import across apps

### Translation discipline

- UI strings should go through `useTranslation()`
- use dot-notation translation keys
- avoid hardcoded user-facing strings in components
- update both `en` and `es` whenever a key is added

See `CLAUDE.md`, `AGENTS.md`, and `.claude/rules/` for the full standards.
