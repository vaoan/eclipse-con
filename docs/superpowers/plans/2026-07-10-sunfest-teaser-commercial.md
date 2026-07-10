# Sunfest 2027 Commercial Photo Teaser — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the single-screen Sunfest 2027 teaser into a scrollable, commercial teaser with real Hotel Mocawa photos, keeping the carnaval brand and the follow-the-community goal.

**Architecture:** `App.tsx` becomes a thin composition of section components stacked inside a `.stage` shell whose ambient carnaval layers (gradient, confetti, falling flowers) are promoted to full-page `fixed` so they persist through the whole scroll. Each section is separated by a reusable coffee-cherry `GarlandDivider`. Venue photos are optimized WebP files imported from `src/assets/venue/` (inlined to base64 by `vite-plugin-singlefile`), listed with the highlight cards in a single `src/venue.ts` data module.

**Tech Stack:** React 19, Vite 7 + `vite-plugin-singlefile`, Tailwind v4 (`@theme`), react-i18next, lucide-react, Vitest + Testing Library, jsdom.

## Global Constraints

- Package manager: **pnpm** only. Run commands from repo root as `pnpm --filter sunfest2027 <script>`.
- Colors: use **only** the tokens in `src/index.css` `@theme` — yellow `#f7d01a`/`#f7d65d`, magenta `#c8368c`/`#c86095`, purple `#7334a6`/`#874ba7`, teal `#00d9b8`/`#1cc9c1`, ground `#5c2b8c`, ground-2 `#a2317f`, cream `#fdf3df`, ink `#2a0f45`. No raw hex in TSX.
- Type: display `Bricolage Grotesque`, body `Space Grotesk` (already loaded in `index.html`). No new fonts.
- i18n: every user-facing string via `t()`; **every new key must exist in both** `src/locales/es.json` and `src/locales/en.json` (the `i18n-parity.test.ts` test enforces equal key sets — a mismatch fails the build).
- Analytics: every interactive element keeps tracking data-attributes (`data-content-section`, `data-content-id`, and for CTAs `data-cta-id`). Non-interactive sections carry a `data-content-section` on their wrapper for auto visibility tracking.
- Test IDs via `tid()`; class merging via `cn()`.
- JSDoc `/** */` on every exported symbol (enforced by lint).
- Motion: all new animation gated behind `prefers-reduced-motion` (use `usePrefersReducedMotion()` — returns `boolean`).
- No dates, prices, or ticketing anywhere. Stays a teaser.
- Deploy pipeline unchanged (single-file build).

---

## File Structure

**Create:**

- `src/assets/venue/*.webp` — 6 optimized venue photos
- `src/venue.ts` — `VENUE_PHOTOS` and `HIGHLIGHTS` data (single source of truth)
- `src/lib/useScrollReveal.ts` — IntersectionObserver reveal hook (defaults visible when unavailable / reduced-motion)
- `src/components/GarlandDivider.tsx` — reusable coffee-cherry strand between sections
- `src/components/ScrollCue.tsx` — hero "scroll for more" affordance
- `src/sections/Hero.tsx` — hero (extracted from current `App.tsx`)
- `src/sections/WhatIsSunfest.tsx`
- `src/sections/VenueGallery.tsx` — the photo-flag garland (signature)
- `src/sections/Highlights.tsx`
- `src/sections/CtaBand.tsx` — closing CTA + socials + footer
- Test files next to each of the above.

**Modify:**

- `src/App.tsx` — thin composition
- `src/index.css` — full-page ambient + section/divider/gallery/card styles
- `src/locales/es.json`, `src/locales/en.json` — new key groups
- `src/App.test.tsx` — adjust for new composition

---

## Task 1: Venue photos + data module

**Files:**

- Create: `src/assets/venue/pool.webp`, `valley.webp`, `fonda.webp`, `grounds.webp`, `landscape.webp`, `pool-nature.webp`
- Create: `src/venue.ts`
- Test: `src/venue.test.ts`

**Interfaces:**

- Produces:
  - `interface VenuePhoto { readonly src: string; readonly altKey: string; readonly captionKey: string; }`
  - `const VENUE_PHOTOS: readonly VenuePhoto[]` (length 6)
  - `interface HighlightCard { readonly icon: LucideIcon; readonly labelKey: string; readonly color: string; }`
  - `const HIGHLIGHTS: readonly HighlightCard[]` (length 6)

- [ ] **Step 1: Download the six photos**

Run from repo root (these are the hotel's already-optimized WebP variants, 48–158 KB each):

```bash
cd apps/sunfest2027 && mkdir -p src/assets/venue
base=https://hotelmocawaresort.com/wp-content/uploads/2024/12
curl -sL "$base/galeria-piscina-hotel-mocawa-resort-image-1-1024x683.webp"  -o src/assets/venue/pool.webp
curl -sL "$base/paisaje-el-quindio-mocawa-resort-image-768x508.webp"        -o src/assets/venue/valley.webp
curl -sL "$base/fonda-tipica-hotel-mocawa-resort-image-1-1024x680.webp"     -o src/assets/venue/fonda.webp
curl -sL "$base/hotel.mocawa-resort-galeria-image-1.webp"                   -o src/assets/venue/grounds.webp
curl -sL "$base/la-tebaida-quindio-hotel-mocawa-resort.webp"               -o src/assets/venue/landscape.webp
curl -sL "$base/galeria-piscina-hotel-mocawa-resort-image-10-1024x768.webp" -o src/assets/venue/pool-nature.webp
```

Then **view each file** and confirm it depicts its intended subject (pool, valley, fonda/dining, resort grounds, coffee landscape, pool-in-nature). If any image is wrong or missing, replace it with another candidate from the gallery listing (any `…galeria-piscina…`, `…fonda-tipica…`, `…paisaje…`, or `hotel.mocawa-resort-galeria-image-N.webp` URL under the same `$base`) and keep the local filename. If a file exceeds ~150 KB and you want it smaller, recompress in place: `convert src/assets/venue/pool.webp -resize 1200x -quality 72 src/assets/venue/pool.webp`.

- [ ] **Step 2: Write the failing test**

```ts
// src/venue.test.ts
import { describe, expect, it } from "vitest";
import { HIGHLIGHTS, VENUE_PHOTOS } from "@/venue";

describe("venue data", () => {
  it("exposes six photos with src, alt key and caption key", () => {
    expect(VENUE_PHOTOS).toHaveLength(6);
    for (const photo of VENUE_PHOTOS) {
      expect(typeof photo.src).toBe("string");
      expect(photo.src.length).toBeGreaterThan(0);
      expect(photo.altKey.startsWith("venue.")).toBe(true);
      expect(photo.captionKey.startsWith("venue.")).toBe(true);
    }
  });

  it("exposes six highlight cards with an icon, label key and palette color", () => {
    expect(HIGHLIGHTS).toHaveLength(6);
    for (const card of HIGHLIGHTS) {
      expect(typeof card.icon).toBe("function");
      expect(card.labelKey.startsWith("highlights.")).toBe(true);
      expect(card.color.startsWith("var(--color-")).toBe(true);
    }
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm --filter sunfest2027 test -- venue`
Expected: FAIL — cannot resolve `@/venue`.

- [ ] **Step 4: Implement `src/venue.ts`**

```ts
import {
  Coffee,
  Mountain,
  PartyPopper,
  Sparkles,
  TreePalm,
  Waves,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import fonda from "@/assets/venue/fonda.webp";
import grounds from "@/assets/venue/grounds.webp";
import landscape from "@/assets/venue/landscape.webp";
import pool from "@/assets/venue/pool.webp";
import poolNature from "@/assets/venue/pool-nature.webp";
import valley from "@/assets/venue/valley.webp";

/** One Hotel Mocawa photo shown as a carnaval flag, with i18n keys for its text. */
export interface VenuePhoto {
  readonly src: string;
  readonly altKey: string;
  readonly captionKey: string;
}

/** The curated venue photos, in display order, strung across the gallery. */
export const VENUE_PHOTOS: readonly VenuePhoto[] = [
  {
    src: pool,
    altKey: "venue.photos.pool.alt",
    captionKey: "venue.photos.pool.caption",
  },
  {
    src: valley,
    altKey: "venue.photos.valley.alt",
    captionKey: "venue.photos.valley.caption",
  },
  {
    src: fonda,
    altKey: "venue.photos.fonda.alt",
    captionKey: "venue.photos.fonda.caption",
  },
  {
    src: grounds,
    altKey: "venue.photos.grounds.alt",
    captionKey: "venue.photos.grounds.caption",
  },
  {
    src: landscape,
    altKey: "venue.photos.landscape.alt",
    captionKey: "venue.photos.landscape.caption",
  },
  {
    src: poolNature,
    altKey: "venue.photos.poolNature.alt",
    captionKey: "venue.photos.poolNature.caption",
  },
];

/** A single "what you'll find" highlight: a lucide icon, a label key and a palette accent. */
export interface HighlightCard {
  readonly icon: LucideIcon;
  readonly labelKey: string;
  readonly color: string;
}

/** The six highlight cards; colors cycle the four official carnaval hues. */
export const HIGHLIGHTS: readonly HighlightCard[] = [
  { icon: Waves, labelKey: "highlights.pools", color: "var(--color-teal)" },
  { icon: Sparkles, labelKey: "highlights.spa", color: "var(--color-yellow)" },
  {
    icon: Coffee,
    labelKey: "highlights.coffee",
    color: "var(--color-magenta)",
  },
  {
    icon: TreePalm,
    labelKey: "highlights.nature",
    color: "var(--color-purple-soft)",
  },
  {
    icon: Mountain,
    labelKey: "highlights.mountains",
    color: "var(--color-teal)",
  },
  {
    icon: PartyPopper,
    labelKey: "highlights.carnaval",
    color: "var(--color-yellow)",
  },
];
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm --filter sunfest2027 test -- venue`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add apps/sunfest2027/src/assets/venue apps/sunfest2027/src/venue.ts apps/sunfest2027/src/venue.test.ts
git commit -m "feat(sunfest): add venue photos and data module"
```

---

## Task 2: Copy — all new i18n keys (ES + EN)

**Files:**

- Modify: `src/locales/es.json`
- Modify: `src/locales/en.json`
- Test: `src/copy.test.ts` (new)

**Interfaces:**

- Produces: key groups `teaser.scrollCue`, `about.*`, `venue.*` (incl. `venue.photos.<id>.{alt,caption}`), `highlights.*`, `cta.*`.

- [ ] **Step 1: Write the failing test**

```ts
// src/copy.test.ts
import { describe, expect, it } from "vitest";
import en from "@/locales/en.json";
import es from "@/locales/es.json";

const REQUIRED = [
  "teaser.scrollCue",
  "about.eyebrow",
  "about.title",
  "about.body",
  "venue.eyebrow",
  "venue.title",
  "venue.subtitle",
  "venue.photos.pool.alt",
  "venue.photos.pool.caption",
  "venue.photos.poolNature.alt",
  "venue.photos.poolNature.caption",
  "highlights.eyebrow",
  "highlights.title",
  "highlights.pools",
  "highlights.spa",
  "highlights.coffee",
  "highlights.nature",
  "highlights.mountains",
  "highlights.carnaval",
  "cta.eyebrow",
  "cta.title",
  "cta.body",
];

/** Resolve a dot path like "venue.photos.pool.alt" against a locale object. */
function get(obj: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>((acc, k) => (acc as Record<string, unknown>)?.[k], obj);
}

describe.each([
  ["es", es],
  ["en", en],
])("%s copy", (_name, dict) => {
  it.each(REQUIRED)("has a non-empty string at %s", (path) => {
    const value = get(dict, path);
    expect(typeof value).toBe("string");
    expect((value as string).length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter sunfest2027 test -- copy`
Expected: FAIL — keys missing.

- [ ] **Step 3: Add keys to `src/locales/es.json`**

Add these groups alongside the existing `teaser` object (add `scrollCue` inside `teaser`):

```json
{
  "teaser": {
    "eyebrow": "Fiesta del café · Quindío · 2027",
    "language": "Idioma",
    "wordmark": "Sunfest 2027",
    "slogan": "Tiempo de carnaval",
    "subline": "El anuncio completo llega al cerrar Moonfest 2026.",
    "scrollCue": "Desliza",
    "followCta": "Únete a la manada",
    "socialsLabel": "Redes de Furry Colombia",
    "followOn": "Síguenos en",
    "footer": "Furry Colombia"
  },
  "about": {
    "eyebrow": "¿Qué es Sunfest?",
    "title": "Un carnaval furry en el Eje Cafetero",
    "body": "Sunfest 2027 es el próximo gran encuentro de Furry Colombia: días de fiesta, disfraces y comunidad entre montañas, café y palmas de cera. Mismo equipo de Moonfest, nueva estación."
  },
  "venue": {
    "eyebrow": "El lugar",
    "title": "Hotel Mocawa Resort",
    "subtitle": "La Tebaida, Quindío — en el corazón del Paisaje Cultural Cafetero.",
    "photos": {
      "pool": {
        "alt": "Piscina y solárium al aire libre del Hotel Mocawa Resort",
        "caption": "Piscina & solárium"
      },
      "valley": {
        "alt": "Valle del Quindío visto desde el resort",
        "caption": "Valle del Quindío"
      },
      "fonda": {
        "alt": "Fonda típica del resort con decoración cafetera",
        "caption": "Fonda típica"
      },
      "grounds": {
        "alt": "Zonas verdes y arquitectura del Hotel Mocawa Resort",
        "caption": "Zonas verdes"
      },
      "landscape": {
        "alt": "Paisaje cafetero de La Tebaida, Quindío",
        "caption": "Paisaje cafetero"
      },
      "poolNature": {
        "alt": "Piscina rodeada de naturaleza exuberante",
        "caption": "Naturaleza y agua"
      }
    }
  },
  "highlights": {
    "eyebrow": "Lo que te espera",
    "title": "Todo esto, en un solo lugar",
    "pools": "Piscinas & solárium",
    "spa": "Spa",
    "coffee": "Cultura cafetera",
    "nature": "Naturaleza & fauna",
    "mountains": "Montañas de los Andes",
    "carnaval": "Noches de carnaval"
  },
  "cta": {
    "eyebrow": "Prepárate",
    "title": "El carnaval te está esperando",
    "body": "El anuncio completo llega al cerrar Moonfest 2026. Únete a la manada y sé el primero en enterarte."
  }
}
```

- [ ] **Step 4: Add the same keys to `src/locales/en.json`**

```json
{
  "teaser": {
    "eyebrow": "Coffee festival · Quindío · 2027",
    "language": "Language",
    "wordmark": "Sunfest 2027",
    "slogan": "Carnival time",
    "subline": "The full reveal drops when Moonfest 2026 wraps.",
    "scrollCue": "Scroll",
    "followCta": "Join the pack",
    "socialsLabel": "Furry Colombia socials",
    "followOn": "Follow us on",
    "footer": "Furry Colombia"
  },
  "about": {
    "eyebrow": "What is Sunfest?",
    "title": "A furry carnival in Colombia's coffee region",
    "body": "Sunfest 2027 is Furry Colombia's next big gathering: days of festivity, fursuits and community among mountains, coffee and wax palms. Same team as Moonfest, new season."
  },
  "venue": {
    "eyebrow": "The setting",
    "title": "Hotel Mocawa Resort",
    "subtitle": "La Tebaida, Quindío — in the heart of the UNESCO Coffee Cultural Landscape.",
    "photos": {
      "pool": {
        "alt": "Outdoor pool and solarium at Hotel Mocawa Resort",
        "caption": "Pool & solarium"
      },
      "valley": {
        "alt": "The Quindío valley seen from the resort",
        "caption": "Quindío valley"
      },
      "fonda": {
        "alt": "The resort's traditional coffee-country tavern",
        "caption": "Traditional tavern"
      },
      "grounds": {
        "alt": "Green grounds and architecture of Hotel Mocawa Resort",
        "caption": "Green grounds"
      },
      "landscape": {
        "alt": "Coffee-country landscape of La Tebaida, Quindío",
        "caption": "Coffee landscape"
      },
      "poolNature": {
        "alt": "Pool surrounded by lush nature",
        "caption": "Nature & water"
      }
    }
  },
  "highlights": {
    "eyebrow": "What you'll find",
    "title": "All of it, in one place",
    "pools": "Pools & solarium",
    "spa": "Spa",
    "coffee": "Coffee culture",
    "nature": "Nature & wildlife",
    "mountains": "Andes mountains",
    "carnaval": "Carnival nights"
  },
  "cta": {
    "eyebrow": "Get ready",
    "title": "The carnival is waiting for you",
    "body": "The full reveal drops when Moonfest 2026 wraps. Join the pack and be the first to know."
  }
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm --filter sunfest2027 test -- copy i18n-parity`
Expected: PASS — copy keys present in both locales, parity test still green.

- [ ] **Step 6: Commit**

```bash
git add apps/sunfest2027/src/locales/es.json apps/sunfest2027/src/locales/en.json apps/sunfest2027/src/copy.test.ts
git commit -m "feat(sunfest): add teaser section copy in ES and EN"
```

---

## Task 3: Extract Hero from App (pure refactor)

Move the current teaser body into `Hero.tsx` with no visual change yet. FollowCta, SocialLinks and the footer move to the CTA band in Task 8, so the Hero ends after the subline. To keep the app rendering the CTA between tasks, `App.tsx` temporarily renders `<Hero/>` then the existing FollowCta/SocialLinks/footer inline; those move out in Task 8.

**Files:**

- Create: `src/sections/Hero.tsx`
- Modify: `src/App.tsx`
- Test: `src/sections/Hero.test.tsx`

**Interfaces:**

- Produces: `function Hero(): JSX.Element` (renders eyebrow, wordmark heading, slogan, subline, decorative valley/palms/flowers).

- [ ] **Step 1: Write the failing test**

```tsx
// src/sections/Hero.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Hero } from "@/sections/Hero";

describe("Hero", () => {
  it("renders the wordmark heading", () => {
    render(<Hero />);
    expect(
      screen.getByRole("heading", { name: "Sunfest 2027" })
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter sunfest2027 test -- Hero`
Expected: FAIL — cannot resolve `@/sections/Hero`.

- [ ] **Step 3: Create `src/sections/Hero.tsx`**

Move `splitWordmark` and the hero markup out of `App.tsx`. The hero owns its ambient decor (valley/palms/flowers) and its own `.hero` wrapper:

```tsx
import { useTranslation } from "react-i18next";
import { Flower } from "@/components/Flower";
import { ScrollCue } from "@/components/ScrollCue";
import { WaxPalm } from "@/components/WaxPalm";
import { tid } from "@/lib/tid";

/** Split a "Brand YEAR" wordmark into its brand and trailing-year parts. */
function splitWordmark(wordmark: string): readonly [string, string] {
  const lastSpace = wordmark.lastIndexOf(" ");
  if (lastSpace > 0) {
    const tail = wordmark.slice(lastSpace + 1);
    if (/^\d{4}$/.test(tail)) {
      return [wordmark.slice(0, lastSpace), tail];
    }
  }
  return [wordmark, ""];
}

/** Full-height hero: carnaval wordmark over a stand of Quindío wax palms. */
export function Hero() {
  const { t } = useTranslation();
  const wordmark = t("teaser.wordmark");
  const [brand, year] = splitWordmark(wordmark);

  return (
    <section
      className="hero"
      data-content-section="teaser"
      data-testid={tid("hero")}
    >
      <div className="valley" aria-hidden="true">
        <WaxPalm className="palm palm-1" src="/assets/palm-1.svg" />
        <WaxPalm className="palm palm-2" src="/assets/palm-2.svg" />
        <WaxPalm className="palm palm-3" src="/assets/palm-3.svg" />
        <WaxPalm className="palm palm-4" src="/assets/palm-4.svg" />
      </div>

      <Flower
        className="flower flower-1"
        variant={0}
        color="var(--color-magenta)"
      />
      <Flower
        className="flower flower-2"
        variant={2}
        color="var(--color-teal)"
      />
      <Flower
        className="flower flower-3"
        variant={3}
        color="var(--color-yellow)"
      />

      <div className="content">
        <p className="eyebrow">{t("teaser.eyebrow")}</p>
        <h1 className="wordmark" aria-label={wordmark}>
          <span aria-hidden="true">{brand}</span>
          {year && (
            <span className="year" aria-hidden="true">
              {year}
            </span>
          )}
        </h1>
        <p className="slogan">{t("teaser.slogan")}</p>
        <p className="subline">{t("teaser.subline")}</p>
        <ScrollCue />
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create a placeholder `src/components/ScrollCue.tsx`** (fleshed out in Task 5; minimal now so Hero compiles)

```tsx
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

/** Decorative "scroll for more" cue shown at the bottom of the hero. */
export function ScrollCue() {
  const { t } = useTranslation();
  return (
    <span className="scroll-cue" aria-hidden="true">
      {t("teaser.scrollCue")}
      <ChevronDown className="size-4" />
    </span>
  );
}
```

- [ ] **Step 5: Update `src/App.tsx` to use Hero (keep CTA inline for now)**

```tsx
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FallingFlowers } from "@/components/FallingFlowers";
import { FollowCta } from "@/components/FollowCta";
import { LanguageToggle } from "@/components/LanguageToggle";
import { SocialLinks } from "@/components/SocialLinks";
import { Hero } from "@/sections/Hero";
import { tid } from "@/lib/tid";

/** Sunfest 2027 commercial teaser: a scrollable coffee-carnaval over the Quindío valley. */
export function App() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <main className="stage" data-testid={tid("teaser-root")}>
      <LanguageToggle />
      <FallingFlowers />
      <div className="confetti" aria-hidden="true" />
      <div className="garland" aria-hidden="true" />

      <Hero />

      <div className="content">
        <FollowCta />
        <SocialLinks />
        <footer className="footer">{t("teaser.footer")}</footer>
      </div>
    </main>
  );
}
```

- [ ] **Step 6: Run tests**

Run: `pnpm --filter sunfest2027 test`
Expected: PASS — Hero test green, existing App test still green (heading + follow CTA + instagram link all present exactly once).

- [ ] **Step 7: Commit**

```bash
git add apps/sunfest2027/src/sections/Hero.tsx apps/sunfest2027/src/sections/Hero.test.tsx apps/sunfest2027/src/components/ScrollCue.tsx apps/sunfest2027/src/App.tsx
git commit -m "refactor(sunfest): extract Hero section from App"
```

---

## Task 4: Full-page ambient + hero/stage CSS restructure

Promote the ambient carnaval (gradient, confetti, falling flowers) to `fixed` so it covers the whole scroll, and give the hero its own `100dvh` box. No new elements — CSS only.

**Files:**

- Modify: `src/index.css`
- Test: manual (build + visual). No unit test — this is styling.

- [ ] **Step 1: Edit `.stage` and its ambient layers in `src/index.css`**

Replace the current `.stage` block (the `display:grid; place-items:center; min-height:100dvh; overflow:hidden; padding …` rules) with a plain full-width flow container, and make the background layers fixed:

```css
/* ---- Stage: the page shell; ambient carnaval is fixed behind everything --- */
.stage {
  position: relative;
  isolation: isolate;
  min-height: 100dvh;
}

/* Vivid carnaval field — fixed so it fills the viewport through the whole scroll. */
.stage::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -4;
  background:
    radial-gradient(
      125% 90% at 50% 116%,
      rgba(247, 208, 26, 0.34),
      transparent 54%
    ),
    radial-gradient(
      120% 70% at 50% 16%,
      rgba(0, 217, 184, 0.16),
      transparent 48%
    ),
    linear-gradient(168deg, #5c2b8c 0%, #7a2c88 38%, #a2317f 72%, #c8368c 100%);
}
```

Change `.confetti` from `position: absolute; inset: -20% 0 0;` to fixed full-viewport:

```css
.confetti {
  position: fixed;
  inset: 0;
  z-index: -3;
  /* …unchanged background-image / size / animation… */
}
```

Change `.flower-fall` (the FallingFlowers container) from `position: absolute;` to `position: fixed;` (keep `inset: 0; z-index: -1; overflow: hidden; pointer-events: none; contain: layout paint;`).

- [ ] **Step 2: Add the `.hero` section box** (the hero now owns what `.stage` used to do)

```css
/* ---- Hero: the full-height carnaval headline ----------------------------- */
.hero {
  position: relative;
  min-height: 100dvh;
  display: grid;
  place-items: center;
  overflow: hidden;
  padding: clamp(3.5rem, 7vw, 5rem) clamp(1.5rem, 5vw, 4rem)
    clamp(2rem, 5vw, 4rem);
  text-align: center;
}
```

The existing `.valley`, `.palm-*`, `.flower-*` rules are unchanged — they now position against `.hero` (their nearest positioned ancestor) instead of `.stage`, which is the intended effect (palms sit at the hero's base). The `.content` rule is unchanged.

- [ ] **Step 3: Add the scroll cue style**

```css
.scroll-cue {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  margin-top: clamp(1.5rem, 5vh, 3rem);
  font-family: var(--font-body);
  font-size: 0.7rem;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: var(--color-cream);
  opacity: 0.7;
  animation: cue-bob 2s ease-in-out infinite;
}

@keyframes cue-bob {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(5px);
  }
}
```

Add `.scroll-cue` to the existing `@media (prefers-reduced-motion: reduce)` block's animation-off list.

- [ ] **Step 4: Build to verify no visual regression on the hero**

Run: `pnpm --filter sunfest2027 dev` and confirm the hero looks as before (wordmark centered, palms at base, confetti + falling flowers drifting), and that the confetti/gradient now stay fixed when you scroll (nothing to scroll to yet — the temporary CTA block sits below).

- [ ] **Step 5: Commit**

```bash
git add apps/sunfest2027/src/index.css
git commit -m "style(sunfest): make ambient carnaval full-page and give hero its own box"
```

---

## Task 5: GarlandDivider + real ScrollCue + useScrollReveal

Build the shared connective tissue (garland strand) and the reveal hook the sections will use.

**Files:**

- Create: `src/components/GarlandDivider.tsx`
- Modify: `src/components/ScrollCue.tsx` (already complete from Task 3 — no change needed; skip if unchanged)
- Create: `src/lib/useScrollReveal.ts`
- Test: `src/components/GarlandDivider.test.tsx`, `src/lib/useScrollReveal.test.ts`

**Interfaces:**

- Produces:
  - `function GarlandDivider(): JSX.Element` — a full-width `aria-hidden` strand.
  - `function useScrollReveal(): { ref: RefCallback<HTMLElement>; revealed: boolean }` — `revealed` is `true` immediately when reduced-motion is on or `IntersectionObserver` is unavailable; otherwise flips to `true` when the element scrolls into view.

- [ ] **Step 1: Write the failing tests**

```tsx
// src/components/GarlandDivider.test.tsx
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GarlandDivider } from "@/components/GarlandDivider";

describe("GarlandDivider", () => {
  it("renders a decorative, hidden divider", () => {
    const { container } = render(<GarlandDivider />);
    const el = container.querySelector(".garland-divider");
    expect(el).not.toBeNull();
    expect(el).toHaveAttribute("aria-hidden", "true");
  });
});
```

```ts
// src/lib/useScrollReveal.test.ts
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useScrollReveal } from "@/lib/useScrollReveal";

describe("useScrollReveal", () => {
  it("defaults to revealed when IntersectionObserver is unavailable (jsdom)", () => {
    const { result } = renderHook(() => useScrollReveal());
    expect(result.current.revealed).toBe(true);
    expect(typeof result.current.ref).toBe("function");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter sunfest2027 test -- GarlandDivider useScrollReveal`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement `src/lib/useScrollReveal.ts`**

```ts
import { useCallback, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/** Return type of {@link useScrollReveal}. */
interface ScrollReveal {
  readonly ref: (node: HTMLElement | null) => void;
  readonly revealed: boolean;
}

/**
 * Reveals an element once it scrolls into view. Returns `revealed: true`
 * immediately when reduced motion is preferred or IntersectionObserver is
 * unavailable, so content is never hidden without the observer.
 */
export function useScrollReveal(): ScrollReveal {
  const prefersReducedMotion = usePrefersReducedMotion();
  const supported = typeof IntersectionObserver !== "undefined";
  const [revealed, setRevealed] = useState(prefersReducedMotion || !supported);
  const observer = useRef<IntersectionObserver | null>(null);

  const ref = useCallback(
    (node: HTMLElement | null) => {
      observer.current?.disconnect();
      if (!node || prefersReducedMotion || !supported) {
        return;
      }
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            setRevealed(true);
            observer.current?.disconnect();
          }
        },
        { rootMargin: "0px 0px -12% 0px", threshold: 0.15 }
      );
      observer.current.observe(node);
    },
    [prefersReducedMotion, supported]
  );

  return { ref, revealed };
}
```

- [ ] **Step 4: Implement `src/components/GarlandDivider.tsx`** (reuses the coffee-cherry SVG already used by `.garland`)

```tsx
/** A decorative coffee-cherry garland strand separating page sections. */
export function GarlandDivider() {
  return (
    <div className="garland-divider" role="presentation" aria-hidden="true" />
  );
}
```

- [ ] **Step 5: Add the `.garland-divider` style to `src/index.css`** (same SVG as `.garland`, centered strand)

```css
.garland-divider {
  height: 46px;
  margin: clamp(1rem, 4vw, 2.5rem) 0;
  background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='60'><path d='M0 7 Q100 21 200 7' fill='none' stroke='%2300d9b8' stroke-width='3' stroke-linecap='round'/><g fill='%2300d9b8'><ellipse cx='34' cy='20' rx='4' ry='11' transform='rotate(-38 34 20)'/><ellipse cx='48' cy='20' rx='4' ry='11' transform='rotate(38 48 20)'/><ellipse cx='150' cy='20' rx='4' ry='11' transform='rotate(-38 150 20)'/><ellipse cx='164' cy='20' rx='4' ry='11' transform='rotate(38 164 20)'/></g><path d='M92 18 V30' fill='none' stroke='%2300d9b8' stroke-width='2'/><circle cx='87' cy='34' r='5.5' fill='%23c8368c'/><circle cx='97' cy='35' r='5.5' fill='%23f7d01a'/><circle cx='92' cy='42' r='5.5' fill='%23c8368c'/></svg>");
  background-repeat: repeat-x;
  background-position: center;
  filter: drop-shadow(0 5px 6px rgba(30, 12, 58, 0.4));
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `pnpm --filter sunfest2027 test -- GarlandDivider useScrollReveal`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add apps/sunfest2027/src/components/GarlandDivider.tsx apps/sunfest2027/src/components/GarlandDivider.test.tsx apps/sunfest2027/src/lib/useScrollReveal.ts apps/sunfest2027/src/lib/useScrollReveal.test.ts apps/sunfest2027/src/index.css
git commit -m "feat(sunfest): add garland divider and scroll-reveal hook"
```

---

## Task 6: WhatIsSunfest section

**Files:**

- Create: `src/sections/WhatIsSunfest.tsx`
- Modify: `src/index.css`
- Test: `src/sections/WhatIsSunfest.test.tsx`

**Interfaces:**

- Consumes: `useScrollReveal`.
- Produces: `function WhatIsSunfest(): JSX.Element`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/sections/WhatIsSunfest.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WhatIsSunfest } from "@/sections/WhatIsSunfest";

describe("WhatIsSunfest", () => {
  it("renders its heading and body copy", () => {
    render(<WhatIsSunfest />);
    expect(
      screen.getByRole("heading", { name: /coffee region|Eje Cafetero/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Furry Colombia/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter sunfest2027 test -- WhatIsSunfest`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/sections/WhatIsSunfest.tsx`**

```tsx
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
import { tid } from "@/lib/tid";
import { useScrollReveal } from "@/lib/useScrollReveal";

/** "What is Sunfest?" — a short, centered intro to the event. */
export function WhatIsSunfest() {
  const { t } = useTranslation();
  const { ref, revealed } = useScrollReveal();
  return (
    <section
      ref={ref}
      className={cn("section", "section-about", revealed && "is-revealed")}
      data-content-section="about"
      data-testid={tid("about")}
    >
      <p className="section-eyebrow">{t("about.eyebrow")}</p>
      <h2 className="section-title">{t("about.title")}</h2>
      <p className="section-body">{t("about.body")}</p>
    </section>
  );
}
```

- [ ] **Step 4: Add shared section styles + about layout to `src/index.css`**

```css
/* ---- Content sections (below the hero) ----------------------------------- */
.section {
  position: relative;
  z-index: 1;
  margin: 0 auto;
  padding: clamp(2rem, 6vw, 4rem) clamp(1.5rem, 5vw, 4rem);
  max-width: 68rem;
  text-align: center;
  opacity: 1;
  transform: none;
}

/* Scroll reveal: hidden until .is-revealed (see reduced-motion override). */
.section:not(.is-revealed) {
  opacity: 0;
  transform: translateY(24px);
  transition: none;
}

.section.is-revealed {
  opacity: 1;
  transform: none;
  transition:
    opacity 0.6s ease,
    transform 0.6s ease;
}

.section-eyebrow {
  margin: 0 0 0.6rem;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: clamp(0.66rem, 1.6vw, 0.8rem);
  letter-spacing: 0.36em;
  text-transform: uppercase;
  color: var(--color-teal);
  opacity: 0.9;
}

.section-title {
  margin: 0 auto;
  max-width: 22ch;
  font-family: var(--font-display);
  font-weight: 800;
  text-transform: uppercase;
  line-height: 0.95;
  letter-spacing: -0.01em;
  font-size: clamp(1.9rem, 6vw, 3.4rem);
  color: var(--color-yellow);
  text-wrap: balance;
  text-shadow: 0 4px 24px rgba(42, 15, 69, 0.5);
}

.section-body {
  margin: 1rem auto 0;
  max-width: 52ch;
  font-family: var(--font-body);
  font-size: clamp(0.98rem, 2vw, 1.15rem);
  line-height: 1.6;
  color: var(--color-cream);
  opacity: 0.9;
}
```

Add `.section:not(.is-revealed)` / `.section.is-revealed` to the `prefers-reduced-motion` block so reduced-motion users always see revealed content:

```css
@media (prefers-reduced-motion: reduce) {
  .section:not(.is-revealed) {
    opacity: 1;
    transform: none;
  }
  /* …existing entries… */
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm --filter sunfest2027 test -- WhatIsSunfest`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/sunfest2027/src/sections/WhatIsSunfest.tsx apps/sunfest2027/src/sections/WhatIsSunfest.test.tsx apps/sunfest2027/src/index.css
git commit -m "feat(sunfest): add What is Sunfest intro section"
```

---

## Task 7: VenueGallery section (the photo-flag garland — signature)

**Files:**

- Create: `src/sections/VenueGallery.tsx`
- Modify: `src/index.css`
- Test: `src/sections/VenueGallery.test.tsx`

**Interfaces:**

- Consumes: `VENUE_PHOTOS`, `useScrollReveal`.
- Produces: `function VenueGallery(): JSX.Element`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/sections/VenueGallery.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VenueGallery } from "@/sections/VenueGallery";

describe("VenueGallery", () => {
  it("renders every venue photo with translated alt text and a caption", () => {
    render(<VenueGallery />);
    const imgs = screen.getAllByRole("img");
    expect(imgs).toHaveLength(6);
    for (const img of imgs) {
      expect(img.getAttribute("alt")).toBeTruthy();
    }
    expect(
      screen.getByText(/Pool & solarium|Piscina & solárium/)
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter sunfest2027 test -- VenueGallery`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/sections/VenueGallery.tsx`**

```tsx
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
import { tid } from "@/lib/tid";
import { useScrollReveal } from "@/lib/useScrollReveal";
import { VENUE_PHOTOS } from "@/venue";

/** The venue photos strung up as cream-framed carnaval flags on a garland. */
export function VenueGallery() {
  const { t } = useTranslation();
  const { ref, revealed } = useScrollReveal();
  return (
    <section
      ref={ref}
      className={cn("section", "section-venue", revealed && "is-revealed")}
      data-content-section="venue"
      data-testid={tid("venue")}
    >
      <p className="section-eyebrow">{t("venue.eyebrow")}</p>
      <h2 className="section-title">{t("venue.title")}</h2>
      <p className="section-body">{t("venue.subtitle")}</p>

      <ul className="flag-garland">
        {VENUE_PHOTOS.map((photo) => (
          <li key={photo.captionKey} className="flag">
            <figure className="flag-figure">
              <img
                src={photo.src}
                alt={t(photo.altKey)}
                loading="lazy"
                decoding="async"
              />
              <figcaption className="flag-caption">
                {t(photo.captionKey)}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 4: Add the flag-garland styles to `src/index.css`**

```css
/* ---- Venue gallery: photos as cream-framed carnaval flags ---------------- */
.flag-garland {
  list-style: none;
  margin: clamp(1.5rem, 4vw, 2.5rem) 0 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-start;
  gap: clamp(0.75rem, 2.5vw, 1.75rem);
}

.flag {
  width: clamp(150px, 30vw, 260px);
}

.flag:nth-child(odd) {
  transform: rotate(-2.5deg);
}
.flag:nth-child(even) {
  transform: rotate(2.5deg);
  margin-top: 1.25rem;
}

.flag-figure {
  margin: 0;
  padding: 8px 8px 10px;
  background: var(--color-cream);
  border-radius: 5px;
  box-shadow:
    0 14px 30px -12px rgba(30, 12, 58, 0.7),
    inset 0 0 0 1px rgba(42, 15, 69, 0.06);
  transition: transform 0.2s ease;
}

.flag-figure img {
  display: block;
  width: 100%;
  aspect-ratio: 3 / 2;
  object-fit: cover;
  border-radius: 2px;
}

.flag-caption {
  margin-top: 6px;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 0.8rem;
  letter-spacing: 0.02em;
  color: var(--color-ink);
}

.flag:hover .flag-figure {
  transform: translateY(-4px) rotate(-1deg);
}
```

Add `.flag-figure` to the `prefers-reduced-motion` block's `transition: none` list.

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm --filter sunfest2027 test -- VenueGallery`
Expected: PASS (6 images, alt text present, caption visible).

- [ ] **Step 6: Commit**

```bash
git add apps/sunfest2027/src/sections/VenueGallery.tsx apps/sunfest2027/src/sections/VenueGallery.test.tsx apps/sunfest2027/src/index.css
git commit -m "feat(sunfest): add venue photo-flag gallery"
```

---

## Task 8: Highlights section

**Files:**

- Create: `src/sections/Highlights.tsx`
- Modify: `src/index.css`
- Test: `src/sections/Highlights.test.tsx`

**Interfaces:**

- Consumes: `HIGHLIGHTS`, `useScrollReveal`.
- Produces: `function Highlights(): JSX.Element`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/sections/Highlights.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Highlights } from "@/sections/Highlights";

describe("Highlights", () => {
  it("renders a card for every highlight", () => {
    render(<Highlights />);
    expect(
      screen.getByText(/Coffee culture|Cultura cafetera/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Carnival nights|Noches de carnaval/)
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter sunfest2027 test -- Highlights`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/sections/Highlights.tsx`**

```tsx
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
import { tid } from "@/lib/tid";
import { useScrollReveal } from "@/lib/useScrollReveal";
import { HIGHLIGHTS } from "@/venue";

/** "What you'll find" — a grid of icon+label cards accented in carnaval hues. */
export function Highlights() {
  const { t } = useTranslation();
  const { ref, revealed } = useScrollReveal();
  return (
    <section
      ref={ref}
      className={cn("section", "section-highlights", revealed && "is-revealed")}
      data-content-section="highlights"
      data-testid={tid("highlights")}
    >
      <p className="section-eyebrow">{t("highlights.eyebrow")}</p>
      <h2 className="section-title">{t("highlights.title")}</h2>

      <ul className="cards">
        {HIGHLIGHTS.map(({ icon: Icon, labelKey, color }) => (
          <li
            key={labelKey}
            className="card"
            style={{ ["--card-accent" as string]: color }}
          >
            <Icon className="card-icon" aria-hidden="true" />
            <span className="card-label">{t(labelKey)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 4: Add the card styles to `src/index.css`**

```css
/* ---- Highlights: what you'll find ---------------------------------------- */
.cards {
  list-style: none;
  margin: clamp(1.5rem, 4vw, 2.5rem) 0 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(0.75rem, 2vw, 1.25rem);
}

@media (min-width: 720px) {
  .cards {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  padding: clamp(1.1rem, 3vw, 1.6rem) 1rem;
  border-radius: 16px;
  background: rgba(253, 243, 223, 0.08);
  border: 1px solid rgba(253, 243, 223, 0.16);
  border-top: 3px solid var(--card-accent);
  backdrop-filter: blur(3px);
}

.card-icon {
  width: 30px;
  height: 30px;
  color: var(--card-accent);
}

.card-label {
  font-family: var(--font-body);
  font-weight: 600;
  font-size: clamp(0.85rem, 2vw, 1rem);
  color: var(--color-cream);
  text-wrap: balance;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm --filter sunfest2027 test -- Highlights`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/sunfest2027/src/sections/Highlights.tsx apps/sunfest2027/src/sections/Highlights.test.tsx apps/sunfest2027/src/index.css
git commit -m "feat(sunfest): add What you'll find highlight cards"
```

---

## Task 9: CtaBand section (closing CTA + socials + footer)

Move the follow CTA, socials and footer out of `App.tsx` into a dedicated closing band.

**Files:**

- Create: `src/sections/CtaBand.tsx`
- Modify: `src/index.css`
- Test: `src/sections/CtaBand.test.tsx`

**Interfaces:**

- Consumes: `FollowCta`, `SocialLinks`, `useScrollReveal`.
- Produces: `function CtaBand(): JSX.Element`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/sections/CtaBand.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CtaBand } from "@/sections/CtaBand";

describe("CtaBand", () => {
  it("renders the closing title, follow CTA and socials", () => {
    render(<CtaBand />);
    expect(
      screen.getByRole("heading", { name: /waiting|esperando/i })
    ).toBeInTheDocument();
    expect(screen.getByTestId("teaser-follow")).toHaveAttribute(
      "data-cta-id",
      "teaser_follow"
    );
    expect(
      screen.getByRole("link", { name: /instagram/i })
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter sunfest2027 test -- CtaBand`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/sections/CtaBand.tsx`**

```tsx
import { useTranslation } from "react-i18next";
import { FollowCta } from "@/components/FollowCta";
import { SocialLinks } from "@/components/SocialLinks";
import { cn } from "@/lib/cn";
import { tid } from "@/lib/tid";
import { useScrollReveal } from "@/lib/useScrollReveal";

/** Closing band: the reveal promise, the follow CTA, socials and footer. */
export function CtaBand() {
  const { t } = useTranslation();
  const { ref, revealed } = useScrollReveal();
  return (
    <section
      ref={ref}
      className={cn("section", "cta-band", revealed && "is-revealed")}
      data-content-section="cta"
      data-testid={tid("cta-band")}
    >
      <p className="section-eyebrow">{t("cta.eyebrow")}</p>
      <h2 className="section-title">{t("cta.title")}</h2>
      <p className="section-body">{t("cta.body")}</p>
      <FollowCta />
      <SocialLinks />
      <footer className="footer">{t("teaser.footer")}</footer>
    </section>
  );
}
```

- [ ] **Step 4: Add cta-band spacing to `src/index.css`** (keep existing `.cta`, `.socials`, `.footer` rules untouched; just give the band vertical rhythm)

```css
/* ---- Closing CTA band ---------------------------------------------------- */
.cta-band {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(0.5rem, 1.5vw, 0.9rem);
  padding-bottom: clamp(3rem, 8vw, 6rem);
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm --filter sunfest2027 test -- CtaBand`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/sunfest2027/src/sections/CtaBand.tsx apps/sunfest2027/src/sections/CtaBand.test.tsx apps/sunfest2027/src/index.css
git commit -m "feat(sunfest): add closing CTA band"
```

---

## Task 10: Compose the full page + finalize App

Assemble all sections with garland dividers and remove the temporary inline CTA block.

**Files:**

- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`
- Test: `src/App.test.tsx`

- [ ] **Step 1: Update `src/App.tsx` to the final composition**

```tsx
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FallingFlowers } from "@/components/FallingFlowers";
import { GarlandDivider } from "@/components/GarlandDivider";
import { LanguageToggle } from "@/components/LanguageToggle";
import { CtaBand } from "@/sections/CtaBand";
import { Hero } from "@/sections/Hero";
import { Highlights } from "@/sections/Highlights";
import { VenueGallery } from "@/sections/VenueGallery";
import { WhatIsSunfest } from "@/sections/WhatIsSunfest";
import { tid } from "@/lib/tid";

/** Sunfest 2027 commercial teaser: a scrollable coffee-carnaval over the Quindío valley. */
export function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <main className="stage" data-testid={tid("teaser-root")}>
      <LanguageToggle />
      <FallingFlowers />
      <div className="confetti" aria-hidden="true" />
      <div className="garland" aria-hidden="true" />

      <Hero />
      <GarlandDivider />
      <WhatIsSunfest />
      <GarlandDivider />
      <VenueGallery />
      <GarlandDivider />
      <Highlights />
      <GarlandDivider />
      <CtaBand />
    </main>
  );
}
```

- [ ] **Step 2: Update `src/App.test.tsx`** (the follow CTA and socials now live in the CTA band; assertions still hold, add a sections-present check)

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "@/App";

describe("Teaser", () => {
  it("renders the hero wordmark and a tracked follow CTA", () => {
    render(<App />);
    expect(
      screen.getByRole("heading", { name: "Sunfest 2027" })
    ).toBeInTheDocument();
    const cta = screen.getByTestId("teaser-follow");
    expect(cta).toHaveAttribute("data-content-id", "follow_telegram");
    expect(cta).toHaveAttribute("data-cta-id", "teaser_follow");
    expect(cta).toHaveAttribute("data-funnel-step", "follow");
  });

  it("renders all teaser sections", () => {
    render(<App />);
    expect(screen.getByTestId("hero")).toBeInTheDocument();
    expect(screen.getByTestId("about")).toBeInTheDocument();
    expect(screen.getByTestId("venue")).toBeInTheDocument();
    expect(screen.getByTestId("highlights")).toBeInTheDocument();
    expect(screen.getByTestId("cta-band")).toBeInTheDocument();
  });

  it("renders the Furry Colombia social links", () => {
    render(<App />);
    expect(screen.getByRole("link", { name: /instagram/i })).toHaveAttribute(
      "data-content-id",
      "social_instagram"
    );
  });
});
```

- [ ] **Step 3: Run the full test suite**

Run: `pnpm --filter sunfest2027 test`
Expected: PASS — all section, venue, copy, parity and App tests green.

- [ ] **Step 4: Commit**

```bash
git add apps/sunfest2027/src/App.tsx apps/sunfest2027/src/App.test.tsx
git commit -m "feat(sunfest): compose scrollable teaser with garland dividers"
```

---

## Task 11: Final gates — typecheck, lint, build, visual review

**Files:** none (verification only).

- [ ] **Step 1: Typecheck**

Run: `pnpm --filter sunfest2027 typecheck`
Expected: no errors. (If the `["--card-accent" as string]` style key errors, keep the `as string` cast shown in Task 8 — it is required for the CSS custom property.)

- [ ] **Step 2: Lint (JSDoc + rules)**

Run: `pnpm --filter sunfest2027 lint` (or repo-root `pnpm lint`)
Expected: no errors. Every new exported symbol has a `/** */` block.

- [ ] **Step 3: Production build (single-file)**

Run: `pnpm --filter sunfest2027 build`
Expected: build succeeds; note the emitted `dist/index.html` size. It should be roughly 0.5–0.8 MB larger than before (the six inlined WebP photos). If it is dramatically larger, recompress the photos (Task 1, Step 1 recompress command) and rebuild.

- [ ] **Step 4: Visual review**

Run: `pnpm --filter sunfest2027 preview` and check in a browser:

- Hero unchanged; confetti + falling flowers keep drifting **as you scroll the whole page** (ambient is fixed and full-page).
- Garland strands separate each section; sections fade/rise in on scroll.
- Venue photos read as tilted cream-framed flags, legible over the purple field; captions readable.
- Highlight cards show cycling hue accents.
- CTA band: follow button + socials + footer.
- Toggle ES/EN — all new copy switches, layout holds.
- Toggle OS reduced-motion — sections are immediately visible (no hidden content), ambient/particle animation stops.
- Resize to mobile width — cards go 2-up, flags wrap, no horizontal scroll.

- [ ] **Step 5: Commit any recompression or fixes** (if none, skip)

```bash
git add -A apps/sunfest2027
git commit -m "chore(sunfest): finalize teaser assets and build"
```

---

## Self-Review

**Spec coverage:**

- Scrollable teaser, 5 sections → Tasks 3,6,7,8,9,10. ✓
- Real Mocawa photos, inlined WebP from `src/assets/venue/` → Task 1. ✓
- Follow/community CTA, no backend → Task 9 (reuses existing `FollowCta`/`SocialLinks`). ✓
- Inherited palette/type used exactly → Global Constraints + all CSS uses tokens. ✓
- Garland connective tissue + photo-flag signature + full-page loud ambient → Tasks 4,5,7. ✓
- Bilingual ES/EN, parity enforced → Task 2 + existing `i18n-parity.test.ts`. ✓
- Reduced-motion respected → `useScrollReveal` default + CSS media block (Tasks 5,6). ✓
- Analytics attributes on interactive elements + section wrappers → each section's `data-content-section`; `FollowCta`/`SocialLinks` keep their attributes. ✓
- No dates → copy in Task 2 withholds them. ✓
- Single-file deploy unchanged → no vite/wrangler config changes. ✓

**Placeholder scan:** No "TBD"/"implement later". The one dynamic step (photo curation) gives exact URLs, a verification instruction, and a concrete fallback pool — not a placeholder.

**Type consistency:** `VenuePhoto`/`HighlightCard` field names (`src`, `altKey`, `captionKey`, `icon`, `labelKey`, `color`) are consistent between Task 1 and their consumers (Tasks 7,8). `useScrollReveal` returns `{ ref, revealed }` consistently across Tasks 5–9. `Hero` exposes `data-testid={tid("hero")}` consumed by Task 10's test.

**Risks:** Photo rights (confirm Mocawa co-promo before public launch) and image subject verification (Task 1 Step 1) are the two human-in-the-loop checks called out in the spec.
