# Sunfest 2027 Teaser Site — Design

- **Date:** 2026-07-06
- **Status:** Approved (design), pending implementation plan
- **Author:** Heiner Angarita + Claude

## 1. Summary

Create **sunfest2027**, a brand-new coming-soon teaser site for next year's event, hosted at
`sunfest.furrycolombia.com`. It is a **separate, self-contained React project** living at
`apps/sunfest/` in this repo. It has its own entry, router, theme, i18n, build, and Cloudflare
deploy. It is **not** reachable from moonfest2026's router and lives on a **different domain**.

The event will be publicly announced at the end of moonfest2026. Until then this site is a
save-the-date placeholder that can be flipped live when we're ready.

## 2. Goals & Non-Goals

### Goals

- A single-screen, self-contained "coming soon / save the date" page with a **sun** vibe.
- Ship as a **single self-contained `index.html`** (the "single page solution"), consistent with
  how moonfest's static build works conceptually.
- Bilingual (`es` default, `en`), matching moonfest's audience.
- One follow/subscribe CTA so interested visitors can be notified (Telegram — the channel the
  project already syncs from).
- Deployable to `sunfest.furrycolombia.com` on Cloudflare without touching moonfest.

### Non-Goals (YAGNI for this phase)

- No registration flow, tutorial, news feed, or multi-route navigation.
- No real 2027 event data (dates/venue/pricing are TBD; page says so).
- No shared component library extraction yet (see §9, Rule of Three).
- No migration of moonfest into `apps/` yet (see §9).

## 3. Hard Constraints

- **Do not touch moonfest2026.** Nothing under `src/`, `index.html`, `wrangler.toml`,
  `cloudflare/worker.mjs`, or `vite.config.ts` may be modified. All sunfest work is **additive**.
- sunfest has its **own router/entry** — no route of moonfest's can reach it and vice versa.
- sunfest lives on a **different domain** (`sunfest.furrycolombia.com`), served by its **own**
  Cloudflare Worker + wrangler config.

## 4. Architecture

Each event is its own independent React project. sunfest is the first to adopt this shape.

```
repo/
  index.html                     # moonfest (UNTOUCHED)
  src/                           # moonfest (UNTOUCHED)
  vite.config.ts                 # moonfest (UNTOUCHED)
  wrangler.toml                  # moonfest (UNTOUCHED)
  cloudflare/worker.mjs          # moonfest (UNTOUCHED)

  apps/
    sunfest/                     # NEW — self-contained project
      index.html                 # sunfest HTML entry (sun favicon, OG tags, es lang)
      vite.config.ts             # own Vite config: react + tailwind v4 + singlefile
      tsconfig.json              # extends repo tsconfig base
      package.json               # optional; scripts can also live in root (see §6)
      public/                    # sun favicon, og-image
      src/
        main.tsx                 # mounts the teaser app
        App.tsx                  # single-screen teaser
        index.css                # Tailwind v4 entry + sun theme tokens
        i18n/
          i18n.ts
          locales/{es,en}.json
        components/              # small presentational pieces (Countdown, FollowCta, etc.)
      dist/                      # build output: single self-contained index.html

  cloudflare/
    sunfest-worker.mjs           # NEW — serves apps/sunfest/dist assets
  wrangler.sunfest.toml          # NEW — route: sunfest.furrycolombia.com/*
```

**Why separate over coexistence:** two events on different timelines with different themes. A
shared Vite/Tailwind config becomes a place where a sunfest change can silently break moonfest.
Isolation removes that class of bug entirely and matches the intended end state (the repo's
`check:*` scripts already reference `apps/*`/`packages/*`).

## 5. Content & Vibe

**Theme:** sun — warm palette (golds, ambers, warm oranges, soft daylight gradients), the deliberate
inverse of moonfest's night/moon look. Own favicon (a sun mark) and OG image.

**Single screen contains:**

1. Wordmark: **Sunfest 2027**.
2. Tagline / one-liner (bilingual), e.g. "The sun rises on the next chapter" — final copy TBD with
   user.
3. "Coming soon — full announcement at the end of Moonfest 2026." Dates/venue explicitly TBD.
4. **Follow CTA** → the Telegram channel, so visitors can be notified. (Single primary CTA.)
5. Small footer: Furry Colombia, year.

Optional (confirm with user during build): a lightweight countdown or "returning in 2027" motif.
Keep it to one screen, no scroll-heavy sections.

## 6. Build — Single Page Solution

- Use `@vitejs/plugin-react` + `@tailwindcss/vite` (v4, same major as moonfest) + **`vite-plugin-singlefile`**.
- `vite-plugin-singlefile` inlines JS/CSS into one `index.html`. This is the simple, battle-tested
  path to the "single page solution" property. We deliberately do **not** copy moonfest's ~600-line
  custom inliner from `vite.config.ts` — that complexity isn't warranted for a teaser, and copying
  it would couple the two projects. If a third event ever needs the advanced inliner, extract it into
  a shared package then (Rule of Three).
- Add `vite-plugin-singlefile` to devDependencies (pnpm).
- **New root `package.json` scripts** (additive; existing scripts untouched):
  - `build:sunfest` → `vite build` scoped to `apps/sunfest` → outputs `apps/sunfest/dist/index.html`.
  - `dev:sunfest` → `vite` dev server for `apps/sunfest`.
  - `deploy:sunfest` → build, then `wrangler deploy --config wrangler.sunfest.toml`.
- Output is a self-contained `index.html` that can be hosted anywhere (Cloudflare, network share,
  carrd, etc.).

## 7. i18n, Analytics, Standards

- **i18n:** own minimal `react-i18next` setup under `apps/sunfest/src/i18n/` with `es` (default) and
  `en`. All teaser copy goes through `t()` — no hardcoded display strings (project i18n rule). Keys
  scoped `teaser.*`.
- **Analytics:** the Follow CTA carries the project's standard tracking data attributes
  (`data-content-section="teaser"`, `data-content-id="follow_telegram"`, `data-cta-id`,
  `data-funnel-step`) per `analytics-tracking.md`. Heavy analytics infra (extremeTracking/PostHog) is
  **out of scope** for the teaser unless the user wants it — keep it lightweight; revisit if the site
  grows into a full event site.
- **Code standards:** function components with `readonly` Props, `cn()` for classes, `tid()` for test
  ids, JSDoc on exported symbols, Tailwind semantic tokens. Follows the repo's existing `.claude/rules`.

## 8. Hosting & Deploy

- **New `wrangler.sunfest.toml`** with `name = "sunfest"` (or similar), `[assets] directory =
"./apps/sunfest/dist"`, `not_found_handling = "single-page-application"`, and:
  ```
  [[routes]]
  pattern = "sunfest.furrycolombia.com/*"
  zone_name = "furrycolombia.com"
  ```
- **New `cloudflare/sunfest-worker.mjs`** — minimal: serve the ASSETS binding. No carrd proxy, no
  runtime-config injection needed for a static teaser (can add later). Simpler than moonfest's worker.
- moonfest's `wrangler.toml` and `cloudflare/worker.mjs` are **never edited**. The two Workers are
  independent deploys on independent routes/subdomains within the same `furrycolombia.com` zone.
- DNS: `sunfest` subdomain record in the `furrycolombia.com` zone (Cloudflare dashboard step, noted in
  the plan; the route binding is committed in `wrangler.sunfest.toml`).

## 9. Future Migration — When Moonfest Ends

This is the phase-two plan, **deliberately deferred** so we never refactor a live site under deadline.

**Trigger:** moonfest2026's event has concluded and its site is no longer at risk.

**Steps (own spec/plan at that time):**

1. Move moonfest into `apps/moonfest/` (relocate `src/`, `index.html`, its `vite.config.ts`,
   `wrangler.toml`, `cloudflare/worker.mjs`).
2. Convert the repo to **pnpm workspaces** (`apps/*`, `packages/*`). The `check:tools`/`check:style`
   scripts in `package.json` already assume this layout — they start working correctly.
3. Extract genuinely shared code into `packages/*` **only where duplication has reached three uses**
   (Tailwind base, tsconfig base, shared UI primitives, the advanced single-file inliner if needed).
4. Each event remains its own app with its own build, theme, router, domain, and deploy — the model
   sunfest establishes now.

**Until then:** a small, intentional asymmetry exists (sunfest in `apps/sunfest/`, moonfest at root).
That is acceptable and resolves in phase two. Two copies of a Tailwind config / token set across two
sites is fine — do not abstract before the third event (Rule of Three).

## 10. Testing

- Unit: at least a smoke test that the teaser renders the wordmark and the Follow CTA with correct
  tracking attributes (Vitest + Testing Library, `getByRole`/`getByTestId`).
- i18n: assert both `es` and `en` locale files contain every `teaser.*` key used.
- Build: `build:sunfest` produces a single `apps/sunfest/dist/index.html` with no external JS/CSS
  references (verify inlining).
- Deploy: `wrangler deploy --config wrangler.sunfest.toml --dry-run` succeeds.

## 11. Open Questions (resolve during build)

- Final tagline/copy (es + en).
- Exact palette / whether to include a countdown or "returns 2027" motif.
- Telegram channel URL for the Follow CTA.
- Worker `name` for `wrangler.sunfest.toml`.
