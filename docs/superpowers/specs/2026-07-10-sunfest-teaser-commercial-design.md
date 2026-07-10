# Sunfest 2027 — Commercial Photo Teaser

**Date:** 2026-07-10
**App:** `apps/sunfest2027`
**Status:** Approved design, pending implementation plan

## Goal

Evolve the existing Sunfest 2027 teaser from a single-screen decorative
"coming soon" into a **scrollable, commercial teaser with real photos** that
tells a visitor _what Sunfest is_ and _what they'll find_ at the venue, then
drives them to follow the community. No dates are announced — this stays a
teaser, not the full site.

## Context

The current teaser (`src/App.tsx`) is a polished but purely illustrated
single screen: carnaval palette (yellow / magenta / purple / teal), CSS/SVG
wax palms, falling flowers, confetti, a wordmark, the slogan "Tiempo de
carnaval," a "join the pack" CTA, and socials. It contains **no photographs**
and says almost nothing about the event.

The venue is **Hotel Mocawa Resort**, La Tebaida, Quindío (Colombia's coffee
region). It offers: adult pool + solarium, children's pool, full-service spa,
coffee-culture immersion, Andes/Maravélez valley views, tennis + putting
green, dining (Restaurante Color, Fonda Típica), and abundant fauna/flora.

Runs by the same **Furry Colombia** crew as Moonfest 2026. Deployed as a
single self-contained HTML file (`vite-plugin-singlefile`) to a Cloudflare
Worker, gated behind Zero Trust preview at `sunfest.furrycolombia.com`.

## Decisions (locked)

- **Image source:** Hotel Mocawa's own resort photography (co-promo — confirm
  their OK before the teaser goes public).
- **Format:** Scrollable teaser with a few lean sections (not the full site).
- **Primary action:** Follow / join the community (Telegram + socials). No
  email capture, no backend.
- **Photo delivery:** Optimized inlined WebP. Download 5–7 Mocawa photos,
  resize to ~1200px wide WebP (~60–100 KB each), let `vite-plugin-singlefile`
  inline them as base64. Keeps the existing single-file deploy pipeline
  untouched. Expected added weight ~500–700 KB — acceptable for a teaser.

## Section structure

A single scrolling page. Hero stays the visual centerpiece; the rest are lean
commercial bands. Keep each section tight.

1. **Hero** — essentially the current screen (wordmark, eyebrow, slogan
   "Tiempo de carnaval," carnaval art, language toggle). Add a subtle
   "scroll for more" affordance. Keep the existing subline about the full
   announcement dropping when Moonfest 2026 closes.
2. **What is Sunfest?** — 2–3 sentences: a furry carnaval gathering in
   Colombia's coffee region, hosted by Furry Colombia (same crew as Moonfest).
   Text-forward, minimal chrome.
3. **The setting — Hotel Mocawa Resort** — a compact gallery/mosaic of 5–7
   real Mocawa photos (pool + solarium, coffee/valley, spa, Andes views,
   dining) with short captions. The "with pictures" payoff.
4. **What you'll find** — a small set (4–6) of icon+label highlight cards
   (pools, spa, coffee immersion, nature/fauna, mountain views, carnaval
   nights). `lucide-react` icons, brand palette.
5. **CTA band** — "The full announcement drops when Moonfest 2026 closes" +
   "Join the pack" (Telegram) + social links + footer.

## Visual direction

Color and type are **inherited and locked** from the existing brand
(`src/index.css` `@theme`) — used exactly, not reinvented:

- Ground: the hero's purple carnaval gradient `#5c2b8c → #a2317f → #c8368c`
  **continues down the whole page** — one unbroken field, no per-section
  color blocks.
- Accents cycle the four official hues (yellow `#f7d01a`, magenta `#c8368c`,
  teal `#00d9b8`, purple `#7334a6`); surfaces/text are cream `#fdf3df` / ink
  `#2a0f45`.
- Display: Bricolage Grotesque (800, uppercase, tight). Body: Space Grotesk.

**Connective tissue — the coffee-cherry garland.** The garland motif already
in the CSS separates sections (a strand between each) instead of hard section
backgrounds, so the page reads as one strung-up carnaval, not stacked blocks.

**Signature element — venue photos as a carnaval-flag garland.** This is where
the design spends its boldness. Not a rectangular image grid (generic, and it
would clash green-photo-on-purple). Each Mocawa photo is a **cream-matted
"print," tilted a few degrees and hung from the garland string** like festival
bunting — overlapping slightly, gently staggered. The cream frame + drop
shadow unifies natural photo tones against the purple ground and keeps photos
legible over the ambient motion; the tilt + string marries the photography to
the carnaval. Reuses a motif already in the codebase, so it reads native.

**Ambient motion stays loud full-page (locked choice).** The hero's ambient
carnaval — confetti, falling flowers, swaying palms — **continues through
every section**, not just the hero. Ambient layers sit behind content
(negative `z-index`) at moderate opacity so captions, cards, and copy stay
readable. Photo legibility is carried by the cream frames and shadows, not by
calming the background.

**Motion discipline.** New motion beyond the existing ambient loops is limited
to: a soft scroll-reveal (fade + rise) per section and a subtle sway on the
photo-flags on hover. All new motion is gated behind `prefers-reduced-motion`.

**"What you'll find" cards.** Small icon+label cards, each accented with one of
the four palette hues, cycling yellow → magenta → teal → purple. Translucent
cream surface over the ground; `lucide-react` icons.

## Architecture

Follows the existing flat sunfest structure (`src/{components,sections,locales}`),
mirroring how the earlier full-site iteration was organized.

- **New:** `src/sections/` — one component per section: `Hero.tsx`,
  `WhatIsSunfest.tsx`, `VenueGallery.tsx`, `Highlights.tsx`, `CtaBand.tsx`.
  `App.tsx` becomes a thin composition that stacks the sections inside the
  existing `.stage`/ambient overlay shell.
- **Reuse:** `FallingFlowers`, `Flower`, `WaxPalm`, `LanguageToggle`,
  `FollowCta`, `SocialLinks` stay as-is; Hero composes them.
- **New:** `src/assets/venue/` holds the optimized WebP photos, imported as ES
  modules so Vite inlines them to base64 in the single-file build (assets in
  `public/` are also inlined, but `src/` imports give hashed, type-checked
  references — use those). A small `src/venue.ts` data module lists photos
  (`{ src, altKey, captionKey }`) and highlight cards (`{ icon, labelKey }`)
  as the single source of truth, so sections map over data instead of
  hardcoding markup.
- **Styling:** extend `src/index.css` with section layout (scroll flow,
  gallery grid, cards). Keep the hero's `100dvh` stage; sections below flow
  normally. Preserve `prefers-reduced-motion` handling.

## Content & i18n

- All strings via `react-i18next`; add keys to **both** `locales/es.json` and
  `locales/en.json` (ES is source, EN mirrors — an i18n-parity test already
  guards this). New key groups: `about.*`, `venue.*`, `highlights.*`,
  `cta.*`, keeping the existing `teaser.*` for hero.
- No dates anywhere. Copy leans commercial/inviting but withholds specifics.
- Photo `alt` text is descriptive and translated.

## Analytics

Per `.claude/rules/analytics-tracking.md`, every interactive element gets
tracking data-attributes:

- CTA button: `data-content-section="cta"`, `data-content-id`, `data-cta-id`.
- Social links: `data-content-section` + `data-content-id` (already present in
  `SocialLinks`/`FollowCta` — verify).
- Gallery items, if any become clickable (e.g. lightbox), get
  `data-content-section="venue"` + a unique `data-content-id`. If the gallery
  is non-interactive, the section is auto-tracked for visibility.

## Accessibility & motion

- Gallery images: real `alt` text, `loading="lazy"` where meaningful.
- Respect `prefers-reduced-motion` for any new scroll/entrance animation
  (extend the existing media query).
- Maintain color contrast on captions/cards against the purple ground.
- Scroll cue is decorative (`aria-hidden`).

## Testing

- Keep/extend `App.test.tsx` (renders, hero wordmark splits correctly).
- i18n parity test already enforces ES/EN key equality — new keys must exist
  in both.
- Add light render tests for the new sections (gallery renders N images with
  alt text; highlights render N cards; CTA present).

## Out of scope

- Email/waitlist capture or any backend.
- Announced dates, pricing, ticketing.
- Full-site sections (travel, organizers bios, FAQ, amenities matrix).
- Changing the deploy pipeline (stays single-file).

## Risks / open items

- **Photo rights & availability:** confirm Mocawa is OK with using their
  photos; confirm their WordPress upload URLs are downloadable at usable
  resolution. If not, fall back to fewer photos or request originals.
- **Single-file weight:** if inlined photos push the HTML too large, reduce
  photo count or dimensions before considering the external-assets approach.
