# Static Build

Skill for creating a fully self-contained static build that can be opened directly from the filesystem (double-click `index.html`).

## Steps

1. **Run all checks before building**:

   ```bash
   pnpm typecheck && pnpm lint
   ```

   If any check fails, fix the issues before proceeding.

2. **Clean previous static build**:

   ```bash
   rm -rf dist-static
   ```

3. **Build the static bundle**:

   ```bash
   pnpm build:static
   ```

   This produces a single `dist-static/index.html` file with all CSS and JS inlined. No assets folder, no external dependencies, no server required.

4. **Verify the build**:

   Run the Playwright e2e test against the static build using `file://` protocol:

   ```bash
   pnpm exec playwright test e2e/convention-static.spec.ts --reporter=list
   ```

   All sections must be visible and render correctly.

5. **Report the result**:
   - Confirm the output is a single `index.html` file in `dist-static/`.
   - Report the file size.
   - Confirm the e2e test passed (all sections visible on `file://` protocol).

## How It Works

The static build (`--mode static`) applies three Vite plugins:

- **staticBuildPlugin** — Replaces `createBrowserRouter` with `createHashRouter` so routing works without a server.
- **inlineAssetsPlugin** — After Vite writes the bundle, reads all CSS/JS assets and inlines them directly into `index.html` as `<style>` and `<script type="module">` tags, then deletes the `assets/` folder.
- **Rollup `inlineDynamicImports: true`** — Merges all chunks into a single JS bundle so there are no external `import()` calls.

This eliminates `file://` CORS restrictions since inline module scripts don't need to fetch anything.

## Troubleshooting

- **Blank page when opening**: Ensure `pnpm build:static` was used (not `pnpm build`). Only the static build inlines assets.
- **Build fails with type errors**: Run `pnpm typecheck` first and fix issues.
- **Sections invisible**: The scroll-reveal animation hides sections until scrolled to. If they stay invisible, check the `useScrollReveal` hook returns the three-state (`pending`/`hidden`/`visible`) pattern.
- **E2E test can't find Chromium**: Run `pnpm exec playwright install chromium` first.

## Rules

- Always run `pnpm typecheck && pnpm lint` before building.
- Always verify with the e2e test after building.
- Never commit the `dist-static/` output (it's gitignored).
- The static build disables sourcemaps to reduce file size.
