# Sunfest 2027 Teaser Site — Design

- **Date:** 2026-07-06
- **Status:** Approved (design), pending implementation plan
- **Author:** Heiner Angarita + Claude
- **Related:** [`2026-07-06-moonfest-monorepo-migration-design.md`](./2026-07-06-moonfest-monorepo-migration-design.md) (phase one — prerequisite)

## 1. Summary

Create **sunfest2027**, a coming-soon teaser site for next year's event, hosted at
`sunfest.furrycolombia.com`. It is a **separate, self-contained React app** at **`apps/sunfest2027/`**
in the pnpm workspace established by phase one. It has its own entry, router, theme, i18n, build, and
Cloudflare deploy. It is **not** reachable from moonfest's router and lives on a **different domain**.

The event is publicly announced at the end of moonfest2026. Until then this is a save-the-date
placeholder that can be flipped live when we're ready.

**Prerequisite:** phase one (the moonfest → workspace migration) lands first. Once the workspace
exists, this app is a clean additive addition — no changes to `apps/moonfest2026/`.

## 2. Goals & Non-Goals

### Goals

- A single-screen, self-contained "coming soon / save the date" page with a **sun** vibe.
- Ship as a **single self-contained `index.html`** (the "single page solution"), like moonfest's
  static build conceptually does.
- Bilingual (`es` default, `en`), matching moonfest's audience.
- One follow/subscribe CTA so interested visitors can be notified (Telegram).
- Deployable to `sunfest.furrycolombia.com` on Cloudflare without touching moonfest.

### Non-Goals (YAGNI for this phase)

- No registration flow, tutorial, news feed, or multi-route navigation.
- No real 2027 event data (dates/venue/pricing are TBD; the page says so).
- No `packages/*` shared-code extraction yet (Rule of Three).

## 3. Constraints

- **Additive only.** Adding `apps/sunfest2027/` changes nothing in `apps/moonfest2026/`. The two apps
  share only workspace-level dev tooling (prettier/eslint/husky), never runtime code or config.
- sunfest has its **own router/entry** — no route of moonfest's reaches it and vice versa.
- sunfest lives on a **different domain** (`sunfest.furrycolombia.com`), served by its **own**
  Cloudflare Worker + wrangler config.

## 4. Architecture

A second workspace app alongside moonfest. Both self-contained and symmetric.

```
apps/
  moonfest2026/                  # phase one (existing after migration) — UNCHANGED by this work
  sunfest2027/                   # NEW
    index.html                   # sun favicon, OG tags, es lang
    vite.config.ts               # react + tailwind v4 + vite-plugin-singlefile
    tsconfig.json                # extends workspace tsconfig base
    package.json                 # dev / build / deploy scripts + deps
    public/                      # sun favicon, og-image
    src/
      main.tsx                   # mounts the teaser app
      App.tsx                    # single-screen teaser
      index.css                  # Tailwind v4 entry + sun theme tokens
      i18n/{i18n.ts, locales/{es,en}.json}
      components/                # small presentational pieces (FollowCta, etc.)
    dist/                        # build output: single self-contained index.html
    .env.example                 # near-empty (static teaser needs ~no secrets)

cloudflare/
  sunfest-worker.mjs             # NEW — minimal ASSETS server (or per-app under the app dir)
wrangler.sunfest.toml            # NEW — route: sunfest.furrycolombia.com/*
```

(Exact placement of the worker/wrangler files — repo root vs inside `apps/sunfest2027/` — follows
whatever convention phase one settles for moonfest, for consistency.)

## 5. Content & Vibe

**Theme:** sun — warm palette (golds, ambers, warm oranges, soft daylight gradients), the deliberate
inverse of moonfest's night/moon look. Own favicon (a sun mark) and OG image.

**Single screen contains:**

1. Wordmark: **Sunfest 2027**.
2. Tagline / one-liner (bilingual) — final copy TBD with user.
3. "Coming soon — full announcement at the end of Moonfest 2026." Dates/venue explicitly TBD.
4. **Follow CTA** → the Telegram channel, so visitors can be notified. (Single primary CTA.)
5. Small footer: Furry Colombia, year.

Optional (confirm during build): a lightweight countdown or "returns 2027" motif. One screen, no
scroll-heavy sections.

## 6. Build — Single Page Solution

- `@vitejs/plugin-react` + `@tailwindcss/vite` (v4, same major as moonfest) + **`vite-plugin-singlefile`**.
- `vite-plugin-singlefile` inlines JS/CSS into one `index.html` — the simple, battle-tested path to
  the "single page solution." We deliberately do **not** copy moonfest's ~600-line custom inliner; if
  a third event ever needs it, extract it into `packages/*` then (Rule of Three).
- Add `vite-plugin-singlefile` to the sunfest app's devDependencies.
- Scripts on `apps/sunfest2027/package.json`: `dev`, `build` (→ `apps/sunfest2027/dist/index.html`),
  `deploy:cloudflare`. Root delegates via `pnpm --filter sunfest2027 <script>`.

## 7. i18n, Analytics, Standards

- **i18n:** own minimal `react-i18next` setup under `apps/sunfest2027/src/i18n/` with `es` (default)
  and `en`. All copy via `t()` — no hardcoded display strings. Keys scoped `teaser.*`.
- **Analytics:** the Follow CTA carries the project's standard tracking data attributes
  (`data-content-section="teaser"`, `data-content-id="follow_telegram"`, `data-cta-id`,
  `data-funnel-step`) per `analytics-tracking.md`. Heavy analytics infra (extremeTracking/PostHog) is
  out of scope for the teaser unless the user wants it.
- **Code standards:** function components with `readonly` Props, `cn()`, `tid()`, JSDoc on exports,
  Tailwind semantic tokens — per the repo's `.claude/rules`.

## 8. Hosting & Deploy

- **`wrangler.sunfest.toml`** (or `apps/sunfest2027/wrangler.toml`, matching phase-one convention):
  `name = "sunfest2027"` (confirm), `[assets] directory` → the sunfest `dist`,
  `not_found_handling = "single-page-application"`, and:
  ```
  [[routes]]
  pattern = "sunfest.furrycolombia.com/*"
  zone_name = "furrycolombia.com"
  ```
- **Minimal worker** — serve the ASSETS binding. No carrd proxy, no runtime-config injection needed
  for a static teaser.
- moonfest's worker/wrangler are never edited. Independent deploys on independent routes within the
  same `furrycolombia.com` zone. Deploy uses the shared root `CLOUDFLARE_API_TOKEN` (see migration
  spec §6).
- DNS: `sunfest` subdomain record in the `furrycolombia.com` zone (Cloudflare dashboard step).

## 9. Testing

- Unit: smoke test that the teaser renders the wordmark and the Follow CTA with correct tracking
  attributes (Vitest + Testing Library, `getByRole`/`getByTestId`).
- i18n: assert both `es` and `en` contain every `teaser.*` key used.
- Build: `pnpm --filter sunfest2027 build` produces a single `index.html` with no external JS/CSS refs.
- Deploy: `wrangler deploy ... --dry-run` succeeds.

## 10. Open Questions (resolve during build)

- Final tagline/copy (es + en).
- Exact palette / whether to include a countdown or "returns 2027" motif.
- Telegram channel URL for the Follow CTA.
- Worker `name` and worker/wrangler file placement (match phase-one convention).
