# Cloudflare Setup - Progress Log

## Step 1: Install Wrangler CLI

- Installed `wrangler@4.75.0` as a dev dependency via `pnpm add -D wrangler`

## Step 2: Authenticate

- Ran `npx wrangler login` and completed the browser OAuth flow
- Authenticated account: `furrycolombia@gmail.com`
- Account ID: `0f1ff655a120842eda10ac3a65d32a51`

## Step 3: Inspect Existing Cloudflare Resources

### Zone

| Field       | Value                                               |
| ----------- | --------------------------------------------------- |
| Domain      | `furrycolombia.com`                                 |
| Zone ID     | `04a535d85c76121383822de00f42f2d3`                  |
| Status      | Active                                              |
| Plan        | Free                                                |
| Nameservers | `maria.ns.cloudflare.com`, `nile.ns.cloudflare.com` |

### Workers

#### `eclipse-con`

| Field               | Value                                           |
| ------------------- | ----------------------------------------------- |
| Purpose             | Main site worker                                |
| Has assets          | Yes                                             |
| Has modules         | No                                              |
| Compatibility date  | `2025-09-27`                                    |
| Compatibility flags | `nodejs_compat`                                 |
| Workers URL         | `https://eclipse-con.furrycolombia.workers.dev` |
| Custom route        | `moonfest.furrycolombia.com/*`                  |
| Custom domain       | `furrycolombia.com`                             |
| Status              | Working                                         |

#### `moonfest2026`

| Field        | Value                                            |
| ------------ | ------------------------------------------------ |
| Purpose      | Older leftover worker                            |
| Has assets   | No                                               |
| Has modules  | Yes                                              |
| Workers URL  | `https://moonfest2026.furrycolombia.workers.dev` |
| Custom route | None                                             |
| Status       | Broken 404                                       |

### Pages Projects

- None. This release path uses Workers, not Pages.

## Step 4: Add Repo-Based Deployment Config

- Added `wrangler.toml` to the repository
- Configured static asset serving from `./dist`
- Bound the worker route to `moonfest.furrycolombia.com/*`
- Bound the apex domain as a Worker Custom Domain: `furrycolombia.com`
- Added `deploy:cloudflare` and `deploy:cloudflare:dry-run` scripts to `package.json`

Current `wrangler.toml`:

```toml
#:schema node_modules/wrangler/config-schema.json
name = "eclipse-con"
compatibility_date = "2025-09-27"
compatibility_flags = ["nodejs_compat"]

workers_dev = true
preview_urls = true

[assets]
directory = "./dist"
not_found_handling = "single-page-application"

[[routes]]
pattern = "moonfest.furrycolombia.com/*"
zone_name = "furrycolombia.com"

[[routes]]
pattern = "furrycolombia.com"
custom_domain = true

[env.staging]
name = "eclipse-con-staging"

[[env.staging.routes]]
pattern = "staging-moonfest.furrycolombia.com/*"
zone_name = "furrycolombia.com"
```

## Step 5: Validate The Current Project State

Executed locally on 2026-03-17:

```bash
pnpm typecheck
pnpm lint
pnpm build
pnpm exec wrangler deploy --dry-run
```

Results:

- TypeScript check passed
- ESLint passed
- Production build passed
- Wrangler dry run passed
- Cloudflare Worker assets are configured for SPA fallback so browser-history routes resolve to `index.html`

## Step 5.1: Verify Public Endpoints

Checked on 2026-03-17:

- `https://moonfest.furrycolombia.com/` -> HTTP 200
- `https://eclipse-con.furrycolombia.workers.dev/` -> HTTP 200
- `https://furrycolombia.com/` -> Worker custom domain attached; public resolver propagation confirmed on 2026-03-18

Conclusion:

- The custom domain is publicly resolving
- The earlier DNS uncertainty is no longer an active blocker
- The apex host does not use a normal Worker route anymore; it uses a Worker Custom Domain because that was the reliable console-based way to provision it without separate DNS-edit access

## Step 6: Clean Up Release URLs

Updated production-facing URLs to the Cloudflare domain:

- `index.html` canonical URL -> `https://moonfest.furrycolombia.com/`
- `index.html` `og:url` -> `https://moonfest.furrycolombia.com/`
- `index.html` social preview image URLs -> `https://moonfest.furrycolombia.com/og-image.jpg`
- `public/robots.txt` sitemap URL -> `https://moonfest.furrycolombia.com/sitemap.xml`
- `public/sitemap.xml` canonical URL -> `https://moonfest.furrycolombia.com/`
- Footer website link -> `https://moonfest.furrycolombia.com/`
- README live site link -> `https://moonfest.furrycolombia.com/`
- Telegram archive links updated to the current production domain

Adjusted one stale flow:

- Disabled the registration tutorial ticket CTA
- Reason: the tutorial button previously pointed at an obsolete external ticket path, so it is now disabled until the new checkout is published

## Current Assessment

The repo is in good shape for Cloudflare release:

1. Build, lint, and typecheck all pass
2. Wrangler config exists in the repo and matches the current Worker deployment model
3. The main remaining operational check is whether the final ticket checkout flow exists

## Staging Worker

- Added a separate Wrangler environment: `staging`
- Staging Worker name: `eclipse-con-staging`
- Staging route: `staging-moonfest.furrycolombia.com/*`
- Staging deploy commands:
  - `pnpm deploy:cloudflare:staging:dry-run`
  - `pnpm deploy:cloudflare:staging`
- `pnpm deploy:cloudflare:staging` now runs the browser-routing Playwright suite twice: once locally before deploy, then again after deployment against `https://eclipse-con-staging.furrycolombia.workers.dev` by default
- Set `PLAYWRIGHT_BASE_URL` to validate a different staging hostname after deploy
- Production remains isolated on `moonfest.furrycolombia.com/*`
- Cloudflare DNS still needs a proxied record for `staging-moonfest.furrycolombia.com`

## Apex Domain Notes

- `furrycolombia.com` originally failed when configured as a plain Worker route because the session only had enough access to manage Worker routes, not to create the required apex DNS record directly
- the final fix was to switch the apex host to a Worker Custom Domain in `wrangler.toml`
- `wrangler deploy` then provisioned `furrycolombia.com` directly on the Worker
- if local testing still fails while public resolvers succeed, check external resolution with:

```bash
nslookup furrycolombia.com 1.1.1.1
nslookup furrycolombia.com 8.8.8.8
```

- if those resolvers work but your machine still fails, flush local DNS or wait for the local resolver/router cache to expire

## Remaining Follow-Up

- [ ] Delete the broken `moonfest2026` worker if it is no longer needed
- [ ] Re-enable the registration tutorial ticket CTA only after the new ticket checkout URL exists
- [ ] Deploy from this repo with `pnpm deploy:cloudflare`

## Notes

- Canonical and social metadata now point directly at the production domain in `index.html`
