# Static Build

Skill for producing a fully self-contained static build that can be opened
directly from the filesystem (double-click `index.html`).

Targets **`apps/sunfest2027`**, the active site. For the archived Moonfest app
see [Moonfest variant](#moonfest-variant) at the bottom.

## Steps

1. **Run all checks before building**:

   ```bash
   pnpm typecheck && pnpm lint
   ```

   If any check fails, fix the issues before proceeding.

2. **Clean previous static build**:

   ```bash
   rm -rf apps/sunfest2027/dist-static
   ```

3. **Build the static bundle**:

   ```bash
   pnpm build:static
   ```

   This produces a single `apps/sunfest2027/dist-static/index.html` with all
   CSS, JS, fonts, and images inlined. No assets folder, no external
   dependencies, no server required.

4. **Verify the build**:

   ```bash
   pnpm test
   ```

   Sunfest has no E2E suite, so verification is the unit tests plus a manual
   check: open the artifact over `file://` and confirm the hero renders, the
   sections reveal on scroll, the language toggle switches copy, and the
   lightbox opens.

5. **Report the result**:
   - Confirm the output is a single `index.html` in `apps/sunfest2027/dist-static/`.
   - Report the file size.
   - Confirm the unit tests passed.

## How It Works

`vite-plugin-singlefile` (configured in `apps/sunfest2027/vite.config.ts`) is
active for **every** build of this app, not just the static one:

- All JS is merged into one bundle and inlined as `<script type="module">`.
- All CSS is inlined as `<style>`.
- Images imported from `src/assets/` are inlined as data URIs.

This eliminates `file://` CORS restrictions, since inline module scripts don't
need to fetch anything. Because there is no router, no hash-routing shim is
required.

`pnpm build` and `pnpm build:static` therefore produce the same artifact; they
differ only in output directory (`dist/` for the Cloudflare Worker,
`dist-static/` for the portable copy).

## Troubleshooting

- **Blank page when opening**: check the browser console. Inline module scripts still need the document to be served with the right charset — confirm `<meta charset>` survived the build.
- **Build fails with type errors**: run `pnpm typecheck` first and fix issues.
- **Sections invisible**: the scroll-reveal animation hides sections until scrolled to. If they stay invisible, check `useScrollReveal` — it must return `revealed: true` immediately when `IntersectionObserver` is unavailable or reduced motion is preferred.
- **Sections look cramped or uncentered**: every `.section` uses `min-height: var(--section-min-h)` (`100svh`) with `align-content: center`. A section that sets its own `display` (like `.cta-band`) needs `justify-content: center` instead.

## Rules

- Always run `pnpm typecheck && pnpm lint` before building.
- Never commit `dist/` or `dist-static/` output (both are gitignored).
- Add new colours as `@theme` tokens in `src/index.css`, never as literals.

## Moonfest variant

The archived Moonfest app has a much heavier static pipeline — it swaps
`createBrowserRouter` for `createHashRouter`, optimizes and embeds Telegram
media, and dedupes data URIs:

```bash
pnpm build:static:moonfest
pnpm exec playwright test e2e/convention-static.spec.ts --reporter=list
```

Run the Playwright command from `apps/moonfest2026/`. Only touch this if you
were explicitly asked to work on the archived site.
