# Sunfest 2027 Teaser (Phase 2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-screen, sun-themed coming-soon teaser for sunfest2027 as a self-contained `apps/sunfest2027/` workspace app that builds to one inlined `index.html` and deploys to its own Cloudflare Worker on `sunfest.furrycolombia.com`.

**Architecture:** A tiny React 19 + Vite 7 + Tailwind v4 app, built to a single self-contained file via `vite-plugin-singlefile`. Bilingual (es default, en) via a minimal `react-i18next` setup. Its own minimal Cloudflare Worker serves the built asset. Additive only — nothing in `apps/moonfest2026/` or the root tooling changes except adding delegating scripts.

**Tech Stack:** React 19, Vite 7, Tailwind CSS v4 (`@tailwindcss/vite`), `vite-plugin-singlefile`, react-i18next, TypeScript 5, Cloudflare Workers (wrangler).

**Spec:** `docs/superpowers/specs/2026-07-06-sunfest-teaser-site-design.md`

## Global Constraints

- **Additive only:** do NOT modify `apps/moonfest2026/**` or moonfest's worker/wrangler. New app under `apps/sunfest2027/`; new `cloudflare/sunfest-worker.mjs`; new `wrangler.sunfest.toml`.
- App/package name exactly `sunfest2027`; folder `apps/sunfest2027/`. Domain `sunfest.furrycolombia.com`.
- **No deploy in this plan** — build + `wrangler --dry-run` only; the real deploy + DNS is a human step (documented in the final task).
- All user-facing strings via `t()` (react-i18next); keys scoped `teaser.*`; both `es` and `en` locale files carry every key.
- The Follow CTA carries analytics attributes: `data-content-section="teaser"`, `data-content-id="follow_telegram"`, `data-cta-id="teaser_follow"`, `data-funnel-step="follow"`.
- Function components with `readonly` props; `cn()` for classes; `tid()` for test ids; JSDoc on every exported symbol (eslint-plugin-jsdoc is enforced repo-wide); Tailwind semantic/utility classes.
- Single-file output: `pnpm --filter sunfest2027 build` emits one `apps/sunfest2027/dist/index.html` with no external JS/CSS refs.
- Never `--no-verify`; never `git add -A`/`git add .`. Conventional commits ending `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`. pnpm only.

## Content defaults (approved; easy to change later)

- Wordmark: **Sunfest 2027**.
- Save-the-date (es/en): "Vuelve el sol en 2027" / "The sun returns in 2027".
- Sub-line: "Anuncio completo al final de Moonfest 2026." / "Full announcement at the end of Moonfest 2026."
- CTA label: "Síguenos" / "Follow us" → constant `FOLLOW_URL = "https://t.me/FurryMoonfest"` (marked TODO: sunfest channel).
- Footer: "Furry Colombia · 2027".
- Palette: warm sunrise — amber/gold/soft-orange gradient background, deep warm text.

---

## Task 1: Scaffold the sunfest app (builds an empty page)

**Files:**

- Create: `apps/sunfest2027/package.json`, `apps/sunfest2027/tsconfig.json`, `apps/sunfest2027/tsconfig.node.json`, `apps/sunfest2027/vite.config.ts`, `apps/sunfest2027/index.html`, `apps/sunfest2027/src/main.tsx`, `apps/sunfest2027/src/App.tsx`, `apps/sunfest2027/src/index.css`, `apps/sunfest2027/public/sun.svg`
- Modify: root `package.json` (add delegating scripts)

**Interfaces:**

- Produces: workspace app `sunfest2027` with scripts `dev`, `build`, `preview`, `typecheck`. Vite config uses `@vitejs/plugin-react` + `@tailwindcss/vite` + `viteSingleFile()`. `@/*` → `./src/*`.

- [ ] **Step 1: App package.json**

Create `apps/sunfest2027/package.json`:

```json
{
  "name": "sunfest2027",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "clsx": "^2.1.1",
    "i18next": "^25.8.18",
    "i18next-browser-languagedetector": "^8.2.1",
    "lucide-react": "^0.577.0",
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "react-i18next": "^16.5.8",
    "tailwind-merge": "^3.5.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.2.1",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.1.4",
    "tailwindcss": "^4.2.1",
    "typescript": "^5.9.3",
    "vite": "^7.3.1",
    "vite-plugin-singlefile": "^2.2.0"
  }
}
```

- [ ] **Step 2: tsconfigs**

`apps/sunfest2027/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"]
}
```

`apps/sunfest2027/tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 3: Vite config (single-file)**

`apps/sunfest2027/vite.config.ts`:

```ts
import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

/** Vite config for the sunfest teaser: React + Tailwind v4, inlined to one file. */
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
  resolve: { alias: { "@": resolve(import.meta.dirname, "src") } },
});
```

- [ ] **Step 4: index.html + favicon**

`apps/sunfest2027/index.html`:

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/sun.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      name="description"
      content="Sunfest 2027 — Vuelve el sol. Furry Colombia."
    />
    <meta property="og:title" content="Sunfest 2027" />
    <meta
      property="og:description"
      content="The sun returns in 2027. Full announcement at the end of Moonfest 2026."
    />
    <meta property="og:type" content="website" />
    <title>Sunfest 2027</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`apps/sunfest2027/public/sun.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
```

- [ ] **Step 5: Minimal index.css + placeholder main/App**

`apps/sunfest2027/src/index.css`:

```css
@import "tailwindcss";
```

`apps/sunfest2027/src/main.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/App";
import "@/index.css";

const root = document.querySelector("#root");
if (!root) {
  throw new Error("Root element not found");
}
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

`apps/sunfest2027/src/App.tsx` (placeholder — real teaser in Task 3):

```tsx
/** Root component of the sunfest teaser (placeholder until Task 3). */
export function App() {
  return <main>Sunfest 2027</main>;
}
```

- [ ] **Step 6: Root delegating scripts**

In the root `package.json` `scripts`, add (do not remove existing):

```json
    "dev:sunfest": "pnpm --filter sunfest2027 dev",
    "build:sunfest": "pnpm --filter sunfest2027 build",
    "deploy:sunfest": "pnpm --filter sunfest2027 build && wrangler deploy --config wrangler.sunfest.toml"
```

- [ ] **Step 7: Install + build the empty app**

```bash
pnpm install
pnpm --filter sunfest2027 build
```

Expected: install adds `vite-plugin-singlefile`; build emits `apps/sunfest2027/dist/index.html`. Confirm single-file: `node -e "const h=require('fs').readFileSync('apps/sunfest2027/dist/index.html','utf8');console.log('external js:', /<script[^>]+src=\"[^\"]+\.js/.test(h))"` → `external js: false`.

- [ ] **Step 8: Commit**

```bash
git add apps/sunfest2027 package.json pnpm-lock.yaml
git commit -m "feat(sunfest): scaffold apps/sunfest2027 single-file teaser app

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: i18n + utils

**Files:**

- Create: `apps/sunfest2027/src/i18n.ts`, `apps/sunfest2027/src/locales/es.json`, `apps/sunfest2027/src/locales/en.json`, `apps/sunfest2027/src/lib/cn.ts`, `apps/sunfest2027/src/lib/tid.ts`
- Modify: `apps/sunfest2027/src/main.tsx`

**Interfaces:**

- Produces: `cn(...inputs)` (clsx+twMerge), `tid(id)` (returns `data-testid` value in dev, `undefined` in prod), i18n init with `teaser.*` keys. Consumed by Task 3.

- [ ] **Step 1: cn + tid utils**

`apps/sunfest2027/src/lib/cn.ts`:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes with clsx + tailwind-merge conflict resolution. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

`apps/sunfest2027/src/lib/tid.ts`:

```ts
/** Return a data-testid value in dev/test, or undefined in production (stripped). */
export function tid(id: string): string | undefined {
  return import.meta.env.PROD ? undefined : id;
}
```

- [ ] **Step 2: Locale files**

`apps/sunfest2027/src/locales/es.json`:

```json
{
  "teaser": {
    "wordmark": "Sunfest 2027",
    "saveTheDate": "Vuelve el sol en 2027",
    "subline": "Anuncio completo al final de Moonfest 2026.",
    "followCta": "Síguenos",
    "footer": "Furry Colombia · 2027"
  }
}
```

`apps/sunfest2027/src/locales/en.json`:

```json
{
  "teaser": {
    "wordmark": "Sunfest 2027",
    "saveTheDate": "The sun returns in 2027",
    "subline": "Full announcement at the end of Moonfest 2026.",
    "followCta": "Follow us",
    "footer": "Furry Colombia · 2027"
  }
}
```

- [ ] **Step 3: i18n init**

`apps/sunfest2027/src/i18n.ts`:

```ts
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import en from "@/locales/en.json";
import es from "@/locales/es.json";

/** Configured i18next instance for the teaser (es default, en fallback). */
void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { es: { translation: es }, en: { translation: en } },
    fallbackLng: "es",
    supportedLngs: ["es", "en"],
    interpolation: { escapeValue: false },
  });

export default i18n;
```

- [ ] **Step 4: Wire i18n into main.tsx**

Add the import to `apps/sunfest2027/src/main.tsx` after the `index.css` import:

```tsx
import "@/i18n";
```

- [ ] **Step 5: Verify typecheck + build**

Run: `pnpm --filter sunfest2027 typecheck && pnpm --filter sunfest2027 build`
Expected: both PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/sunfest2027/src/i18n.ts apps/sunfest2027/src/locales apps/sunfest2027/src/lib apps/sunfest2027/src/main.tsx
git commit -m "feat(sunfest): i18n (es/en) + cn/tid utils

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: The teaser screen + Follow CTA

**Files:**

- Create: `apps/sunfest2027/src/components/FollowCta.tsx`
- Modify: `apps/sunfest2027/src/App.tsx`, `apps/sunfest2027/src/index.css`

**Interfaces:**

- Consumes: `cn`, `tid`, i18n (`useTranslation`).
- Produces: the full single-screen teaser rendering wordmark, save-the-date, subline, `FollowCta`, footer.

- [ ] **Step 1: Sun theme tokens in index.css**

Replace `apps/sunfest2027/src/index.css` with:

```css
@import "tailwindcss";

@theme {
  --color-sun-bg: #fff7ed;
  --color-sun-glow: #fbbf24;
  --color-sun-deep: #b45309;
  --color-sun-ink: #431407;
}
```

- [ ] **Step 2: FollowCta component (with analytics attributes)**

`apps/sunfest2027/src/components/FollowCta.tsx`:

```tsx
import { Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
import { tid } from "@/lib/tid";

/** Telegram follow URL for notifications. TODO: point at the sunfest channel. */
const FOLLOW_URL = "https://t.me/FurryMoonfest";

/** Props for {@link FollowCta}. */
interface FollowCtaProps {
  readonly className?: string;
}

/** Primary "follow us" call-to-action linking to the Telegram channel. */
export function FollowCta({ className }: Readonly<FollowCtaProps>) {
  const { t } = useTranslation();
  return (
    <a
      href={FOLLOW_URL}
      target="_blank"
      rel="noreferrer"
      data-testid={tid("teaser-follow")}
      data-content-section="teaser"
      data-content-id="follow_telegram"
      data-cta-id="teaser_follow"
      data-funnel-step="follow"
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold",
        "bg-sun-deep text-sun-bg transition-transform hover:scale-105",
        className
      )}
    >
      <Send className="size-5" aria-hidden="true" />
      {t("teaser.followCta")}
    </a>
  );
}
```

- [ ] **Step 3: The teaser App**

Replace `apps/sunfest2027/src/App.tsx` with:

```tsx
import { useTranslation } from "react-i18next";
import { FollowCta } from "@/components/FollowCta";
import { tid } from "@/lib/tid";

/** Single-screen sunfest2027 coming-soon teaser. */
export function App() {
  const { t } = useTranslation();
  return (
    <main
      data-testid={tid("teaser-root")}
      className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-gradient-to-b from-sun-bg to-sun-glow/40 px-6 text-center text-sun-ink"
    >
      <h1 className="text-5xl font-extrabold tracking-tight text-sun-deep md:text-7xl">
        {t("teaser.wordmark")}
      </h1>
      <p className="text-2xl font-semibold md:text-3xl">
        {t("teaser.saveTheDate")}
      </p>
      <p className="max-w-md text-base opacity-80 md:text-lg">
        {t("teaser.subline")}
      </p>
      <FollowCta className="mt-2" />
      <footer className="mt-10 text-sm opacity-70">{t("teaser.footer")}</footer>
    </main>
  );
}
```

- [ ] **Step 4: Verify typecheck + build (single-file)**

Run: `pnpm --filter sunfest2027 typecheck && pnpm --filter sunfest2027 build`
Then: `node -e "const h=require('fs').readFileSync('apps/sunfest2027/dist/index.html','utf8');console.log('external js:', /<script[^>]+src=\"[^\"]+\.js/.test(h), 'has wordmark:', h.includes('Sunfest 2027'))"`
Expected: typecheck+build PASS; `external js: false`; `has wordmark: true`.

- [ ] **Step 5: Commit**

```bash
git add apps/sunfest2027/src/App.tsx apps/sunfest2027/src/components apps/sunfest2027/src/index.css
git commit -m "feat(sunfest): sun-themed teaser screen + follow CTA

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: Smoke test + i18n parity test

**Files:**

- Create: `apps/sunfest2027/src/App.test.tsx`, `apps/sunfest2027/src/i18n-parity.test.ts`, `apps/sunfest2027/vitest.config.ts`, `apps/sunfest2027/src/test-setup.ts`
- Modify: `apps/sunfest2027/package.json` (add test script + vitest devDeps)

- [ ] **Step 1: Add vitest to the app**

In `apps/sunfest2027/package.json`, add to `scripts`: `"test": "vitest run --passWithNoTests"`, and to `devDependencies`:

```json
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.2",
    "jsdom": "^28.1.0",
    "vitest": "^4.0.18"
```

`apps/sunfest2027/vitest.config.ts`:

```ts
import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

/** Vitest config for the sunfest teaser (jsdom + @ alias). */
export default defineConfig({
  resolve: { alias: { "@": resolve(import.meta.dirname, "src") } },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
```

`apps/sunfest2027/src/test-setup.ts`:

```ts
import "@testing-library/jest-dom";
import "@/i18n";
```

- [ ] **Step 2: Smoke test**

`apps/sunfest2027/src/App.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "@/App";

describe("Teaser", () => {
  it("renders the wordmark and a tracked follow CTA", () => {
    render(<App />);
    expect(
      screen.getByRole("heading", { name: "Sunfest 2027" })
    ).toBeInTheDocument();
    const cta = screen.getByRole("link");
    expect(cta).toHaveAttribute("data-content-id", "follow_telegram");
    expect(cta).toHaveAttribute("data-cta-id", "teaser_follow");
    expect(cta).toHaveAttribute("data-funnel-step", "follow");
  });
});
```

- [ ] **Step 3: i18n parity test**

`apps/sunfest2027/src/i18n-parity.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import en from "@/locales/en.json";
import es from "@/locales/es.json";

/** Flatten nested keys into dotted paths for comparison. */
function keys(obj: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === "object"
      ? keys(v as Record<string, unknown>, `${prefix}${k}.`)
      : [`${prefix}${k}`]
  );
}

describe("i18n parity", () => {
  it("es and en have identical key sets", () => {
    expect(keys(es).sort()).toEqual(keys(en).sort());
  });
});
```

- [ ] **Step 4: Install + run tests**

```bash
pnpm install
pnpm --filter sunfest2027 test
```

Expected: both tests PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add apps/sunfest2027/package.json apps/sunfest2027/vitest.config.ts apps/sunfest2027/src/test-setup.ts apps/sunfest2027/src/App.test.tsx apps/sunfest2027/src/i18n-parity.test.ts pnpm-lock.yaml
git commit -m "test(sunfest): teaser smoke test + i18n key parity

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: Cloudflare worker + wrangler + verification

**Files:**

- Create: `cloudflare/sunfest-worker.mjs`, `wrangler.sunfest.toml`
- Verify: build, dry-run, root lint/typecheck

- [ ] **Step 1: Minimal worker**

`cloudflare/sunfest-worker.mjs`:

```javascript
/** Minimal Worker: serve the sunfest teaser's static asset bundle. */
export default {
  async fetch(request, env) {
    return env.ASSETS.fetch(request);
  },
};
```

- [ ] **Step 2: wrangler config**

`wrangler.sunfest.toml`:

```toml
#:schema node_modules/wrangler/config-schema.json
name = "sunfest2027"
compatibility_date = "2025-09-27"
compatibility_flags = ["nodejs_compat"]
main = "cloudflare/sunfest-worker.mjs"

workers_dev = true

[assets]
directory = "./apps/sunfest2027/dist"
not_found_handling = "single-page-application"
binding = "ASSETS"

[[routes]]
pattern = "sunfest.furrycolombia.com/*"
zone_name = "furrycolombia.com"
```

- [ ] **Step 3: Build + dry-run (NO deploy)**

```bash
pnpm --filter sunfest2027 build
node -e "0" # ensure dist exists
npx wrangler deploy --config wrangler.sunfest.toml --dry-run
```

Expected: build emits `apps/sunfest2027/dist/index.html`; `wrangler --dry-run` reports the worker + assets from `./apps/sunfest2027/dist` and exits WITHOUT deploying. If wrangler complains the assets dir is empty, ensure Step build ran first.

- [ ] **Step 4: Root gate still green**

Run: `pnpm lint && pnpm --filter sunfest2027 typecheck`
Expected: PASS. If eslint errors on the new worker `.mjs`, note `cloudflare/**` — the root eslint ignores were set for `apps/*/cloudflare/**`; the shared `cloudflare/` dir at root may need `cloudflare/**` added to the eslint `ignores` (moonfest's worker lives at `apps/moonfest2026/cloudflare/` now, so root `cloudflare/` is new — add `"cloudflare/**"` to `ignores` if lint flags it).

- [ ] **Step 5: Commit**

```bash
git add cloudflare/sunfest-worker.mjs wrangler.sunfest.toml eslint.config.mjs
git commit -m "feat(sunfest): cloudflare worker + wrangler config for sunfest.furrycolombia.com

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

- [ ] **Step 6: Report the deploy + DNS handoff**

Do NOT deploy. Report to the user the manual steps to go live:

1. Add a DNS record for `sunfest` in the `furrycolombia.com` Cloudflare zone (or let the route create it).
2. `pnpm deploy:sunfest` (builds + `wrangler deploy --config wrangler.sunfest.toml`).
3. Swap `FOLLOW_URL` in `FollowCta.tsx` + any copy in `locales/{es,en}.json` when finalized.

---

## Self-Review Notes

- **Spec coverage:** §4 architecture → Tasks 1,5. §5 content → Task 3 + content defaults. §6 single-file build → Task 1 (viteSingleFile). §7 i18n/analytics/standards → Tasks 2,3 (t(), tracking attrs, JSDoc, cn/tid). §8 hosting → Task 5. §9 testing → Task 4.
- **Additive-only:** no task touches `apps/moonfest2026/**` or moonfest's worker/wrangler. Only root `package.json` (new scripts) + root `eslint.config.mjs` (only if lint flags the new worker) are modified.
- **No deploy:** Task 5 is dry-run only; real deploy + DNS + final copy/URL are the user's handoff (Task 5 Step 6).
