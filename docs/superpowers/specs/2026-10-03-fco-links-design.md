# fco.bz — Short Links with Analytics

**Date:** 2026-10-03
**App:** `apps/links` (new)
**Status:** Approved 2026-10-03 (revised the same day: the links are managed in a Google Sheet)

## Goal

Run Furry Colombia's own link shortener on `fco.bz`. Every short link
(`fco.bz/s27`, …) redirects instantly and records the click analytics that
commercial shorteners (Bitly, Dub, Short.io) show.

**The links are managed in a Google Sheet** owned by `furrycolombia@gmail.com`.
Anyone with edit access adds or changes a link by typing a row, with no
technical knowledge needed, and Drive's version history is the backup. A private
dashboard at `admin.fco.bz` shows every link with its stats. Cloudflare Zero
Trust gates the dashboard to an email allow-list.

## Context

- `fco.bz` is registered at Porkbun (renews 2027-10-03, $16.79/yr). Its
  nameservers point to Cloudflare, where the zone exists on the Free plan.
- The account already has a Zero Trust organisation
  (`furrycolombia.cloudflareaccess.com`) with the One-time PIN login method,
  and no Access apps yet.
- Publicity for Sunfest is already designed around `fco.bz/s27`, with QR codes
  sized for that exact string (`publicity/fco-bz-s27-*`).
- The repo is **public**: no email addresses, salts or tokens go in git.

## Decisions (locked with the user)

| Topic      | Decision                                                                            |
| ---------- | ----------------------------------------------------------------------------------- |
| Dashboard  | `admin.fco.bz`, a separate host; `fco.bz/<slug>` is only for links                  |
| Managing   | In a Google Sheet (owner furrycolombia@gmail.com); the Worker syncs it every minute |
| Backup     | The Sheet plus Drive version history; a "Clicks by day" tab is written nightly      |
| IP privacy | Store the location derived from the IP plus a salted daily hash; never the raw IP   |
| Login      | Zero Trust with **both** email one-time code and Google sign-in                     |
| Allow-list | `furrycolombia@gmail.com`, `heinerangarita@gmail.com`; more added later             |

## What "analytics" covers, and what it can't

A redirect sees one HTTP request: the IP address (which Cloudflare resolves to
a location and network), the User-Agent, the Referer, `Accept-Language`, the
URL's query string and the time. Everything below comes from those.

**Age and gender cannot be measured.** No link shortener shows them, Bitly
included, because a request carries no identity. Platforms that show
"demographics" (Meta, Google Analytics) get them from logged-in accounts and
ad networks. The closest honest proxies are geography and language, which this
covers in depth.

Each click records:

- **When:** timestamp, which gives hour of day and day of week (Bogotá time).
- **Where:** continent, country, region/department, city, postal code, latitude
  and longitude (city level, for the map), timezone, and the Cloudflare data
  centre that handled the click.
- **Network:** ISP/ASN number and organisation name, e.g. "Claro", "Movistar",
  "Tigo". Mobile data versus home broadband can be read from this.
- **Device:** device type (mobile/tablet/desktop), OS and version, browser and
  version, device brand and model where the User-Agent reveals them.
- **Source:** referrer host (instagram.com, t.me, …), the full referrer when
  sent, and `utm_source`, `utm_medium`, `utm_campaign`, `utm_content` and
  `utm_term`.
- **Audience language:** the primary `Accept-Language`, e.g. es-CO or en-US.
- **Quality:**
  - `is_bot`: crawlers, uptime checkers and other bots, by User-Agent list.
  - `is_preview`: link-preview fetchers such as WhatsApp, Telegram, Facebook,
    Discord, Slack and X. These are kept and reported as **"shared on"**,
    because a preview fetch means someone pasted the link into that app.
  - `visitor_hash`: an HMAC of IP and User-Agent with a key that rotates
    daily. It gives unique visitors per day without tracking anyone across
    days. This is the same approach Plausible takes.

The dashboard shows humans only by default. Bots and previews are behind a
toggle and in their own "Shared on" panel.

## Architecture

One Worker, `fco-links`, bound to both hosts. It uses one D1 database and
static assets for the dashboard.

```
fco.bz/<slug>        ──► Worker: look up slug → 302 to destination
                                 └─ ctx.waitUntil(record click in D1)
fco.bz/              ──► 302 to https://furrycolombia.com
fco.bz/<unknown>     ──► 302 to https://furrycolombia.com, logged as a miss

admin.fco.bz/*       ──► Cloudflare Access (allow-list) ──► Worker
   /api/*                 JSON API; verifies the Access JWT itself too
   everything else        dashboard SPA (static assets)

Google Sheet "fco.bz links" ──► cron every minute (and "Sync now") ──► D1 links
D1 clicks ──► nightly cron ──► Sheet tab "Clicks by day"
```

### The Google Sheet

Tab **Links** is the source of truth. Its columns:

| slug | destination | label | campaign | active | status (written by sync) |
| ---- | ----------- | ----- | -------- | ------ | ------------------------ |

- **Validation in the Sheet:** `slug` must be lowercase letters, digits or
  hyphens, 1–32 characters; `destination` must start with `https://`;
  `active` is a checkbox. Both errors are caught with a red highlight before
  sync ever sees them.
- **The sync is defensive**, because a typo must never break a printed link:
  - A row that fails validation is skipped, and the previous good version of
    that slug stays live.
  - A duplicate slug: the first row wins and the others are reported.
  - A deleted row does **not** delete the link. The slug keeps its last
    destination, and the dashboard flags it as "missing from Sheet". The only
    way to stop a link is unticking `active`, and an inactive slug then
    redirects to `https://furrycolombia.com`.
  - The sync writes `status` back to each row ("✓ live", or the error in
    Spanish), so whoever is editing sees the result next to their row within
    a minute.
- **Clicks by day tab:** one row per date × slug × country with clicks and
  unique visitors, appended nightly. It's a human-readable backup of the
  numbers. Raw clicks stay in D1, since they would outgrow a Sheet's cell
  limit.
- **Access to the Sheet:** a Google Cloud service account (in a project owned
  by furrycolombia@gmail.com) with the Sheets API enabled. The Sheet is shared
  with it as an Editor, so it can write `status` and the summary tab. Its JSON
  key is a Worker secret. The Worker signs the Google token itself with
  WebCrypto (RS256), so no Google SDK is needed.

### Why these choices

- **302, not 301.** Browsers cache 301s permanently, so repeat visits would
  never reach the Worker and would go uncounted, and a link's destination could
  never change. Responses carry `Cache-Control: private, no-store`.
- **Logging after the response.** The click is written in `ctx.waitUntil`, so
  the visitor's redirect never waits on the database.
- **D1 rather than Workers Analytics Engine.** D1 keeps data indefinitely,
  supports plain SQL with joins against the links table, and its free tier
  (100k writes/day, 5M reads/day) is far above our volume. Analytics Engine
  only keeps 3 months and needs a separate API token to query.
- **Lookups.** One indexed D1 read per click is fast at our scale. A cache can
  be added later if it's ever needed.
- **Defence in depth.** Access protects `admin.fco.bz`, and the Worker also
  validates the `Cf-Access-Jwt-Assertion` header against the team's public keys
  and the app's audience tag on every `/api` call. `workers_dev` is off, so the
  Worker cannot be reached around Access.

### Data model (D1)

```sql
links (
  slug         TEXT PRIMARY KEY,       -- [a-z0-9-]{1,32}, lowercase
  destination  TEXT NOT NULL,          -- absolute https URL
  label        TEXT,                   -- "Sunfest 2027 magnet QR"
  campaign     TEXT,                   -- groups aliases, e.g. "sunfest2027"
  active       INTEGER NOT NULL DEFAULT 1,
  in_sheet     INTEGER NOT NULL DEFAULT 1, -- 0 = row deleted; link kept live
  sheet_row    INTEGER,
  first_seen   INTEGER NOT NULL,
  updated_at   INTEGER NOT NULL
)

sync_runs (id INTEGER PRIMARY KEY, ts INTEGER, ok INTEGER, rows INTEGER,
           changed INTEGER, errors TEXT)   -- JSON list of row problems

daily_stats (date TEXT, slug TEXT, dim TEXT, value TEXT,
             clicks INTEGER, uniques INTEGER, bots INTEGER, previews INTEGER,
             PRIMARY KEY (date, slug, dim, value))
-- dim ∈ total, hour, country, region, city, device, os, browser, lang,
--       as_org, referrer_host, utm_source, utm_medium, utm_campaign, preview_app
rollup_cursor (id INTEGER PRIMARY KEY CHECK (id = 1), last_click_id INTEGER)

clicks (
  id INTEGER PRIMARY KEY, slug TEXT, ts INTEGER,
  country TEXT, region TEXT, city TEXT, postal TEXT, continent TEXT,
  lat REAL, lon REAL, timezone TEXT, colo TEXT,
  asn INTEGER, as_org TEXT,
  device TEXT, os TEXT, os_version TEXT, browser TEXT, browser_version TEXT,
  device_vendor TEXT, device_model TEXT,
  referrer_host TEXT, referrer TEXT, lang TEXT,
  utm_source TEXT, utm_medium TEXT, utm_campaign TEXT, utm_content TEXT, utm_term TEXT,
  is_bot INTEGER, is_preview INTEGER, preview_app TEXT,
  visitor_hash TEXT, miss INTEGER
)
-- indexes: clicks(slug, ts), clicks(ts)
```

D1 holds a synced copy of the Sheet, so a redirect never waits on Google. If
Google is unreachable, the links simply keep their last synced state.

### Where data lives, and how it's backed up

| Data      | Source of truth                             | Backup                                                                                                                           |
| --------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Links     | Google Sheet (D1 holds a synced copy)       | Drive version history                                                                                                            |
| Clicks    | D1 database `fco-links` (new; none existed) | D1 Time Travel (point-in-time restore: 7 days free, 30 paid); nightly "Clicks by day" tab; **raw-clicks CSV export** (see below) |
| Sync runs | D1                                          | Not backed up; it's operational log only                                                                                         |

**Raw-clicks backup (revised 2026-10-03).** A Drive CSV is not possible: a
service account has no storage quota on a consumer Gmail Drive, so it cannot
create files there. R2 is not enabled on the account either. So:

1. `GET admin.fco.bz/api/export.csv?from=&to=&after=` streams raw clicks paged
   by id (50k rows per response; the `X-Next-After` header gives the next
   page). It sits behind Access and the Worker's JWT check, and also accepts a
   Cloudflare Access **service token**, so a scheduled job elsewhere can pull
   it. The dashboard's "Export CSV" button walks every page.
2. **Optional R2:** if a `BACKUP_BUCKET` R2 binding is added, the weekly cron
   writes `clicks/YYYY-Www.csv.gz` there. Without the binding the cron logs and
   skips. The binding is left commented out in `wrangler.toml`.

The Sheet writes (the status column and the "Clicks by day" tab) are
unaffected: the Sheet is owned by the user, and the service account only
edits it.

**D1 Free limits** (checked against developers.cloudflare.com on 2026-10-03):
500 MB per database, 5 GB per account, 5M rows read and 100k rows written per
day, and 7 days of Time Travel. A click row is about 0.5 KB, so one database
holds roughly a million clicks. Workers Paid ($5/month) raises the limits to
10 GB per database, removes the daily caps, and gives 30 days of Time Travel.

**When a daily cap is hit, every D1 query errors until the reset.** Two rules
follow from that:

1. **Redirects never depend on a live D1 read succeeding.** The link table is
   served from the Workers Cache API: a snapshot refreshed after each sync,
   with a 60 s TTL, and the stale copy served if D1 errors. Click logging is
   best-effort in `waitUntil`, so if it fails the visitor is still redirected.
2. **The dashboard never scans raw clicks.** An hourly cron rolls new clicks
   into `daily_stats` (date × slug × dimension × value → clicks, uniques), and
   every chart reads that. Raw rows are read only for the CSV export and the
   optional weekly R2 export, both of which page through by id.

### Channel tracking

The printed QR codes encode exactly `fco.bz/s27`. Adding `?q` would enlarge
the code past its tested size. To tell channels apart, create **aliases**:
separate slugs with the same destination and the same `campaign` (for example
`s27` for print and `s27t` for Telegram). The dashboard rolls a campaign up
and splits it by slug. UTM parameters work as well wherever the URL length
doesn't matter.

## Dashboard (`admin.fco.bz`)

React + Vite + TypeScript + Tailwind v4, following the workspace stack and
conventions: react-i18next with es and en, `tid()`, JSDoc.

- **Links list:** slug, destination, label, campaign, total clicks, unique
  visitors, a 30-day sparkline and last click, with search. Links are edited
  in the Sheet, not here, and an "Open the Sheet" button links to it.
- **Sync panel:** last sync time and result, rejected rows with the reason,
  slugs missing from the Sheet, and a "Sync now" button.
- **Link detail** (also available per campaign):
  - Date range: 24 hours, 7 days, 30 days, all time, or custom.
  - Clicks over time (hourly or daily) with unique visitors.
  - A world map plus country, region and city tables.
  - Device, OS and browser breakdowns; languages; ISPs.
  - Referrers and UTM tables; "Shared on" from preview fetches.
  - An hour-of-day × day-of-week heatmap (Bogotá time).
  - Bots-and-previews toggle and CSV export of the raw rows.
- **Per link:** copy the short URL; download its QR code as SVG or PNG at the
  **print standard** (`src/lib/qr.ts`, the result of the publicity size
  ladder): the smallest code a phone reads from 30 cm.
  - The URL is upper-case, so QR alphanumeric mode applies and `s27` fits
    version 1 (21×21).
  - Level M, no logo.
  - 0.5 mm modules and a 4-module quiet zone, so `s27` is 14.5 mm. Longer slugs
    keep the module size and grow the version.
  - The SVG is sized in mm. The PNG uses 24 px per module and carries a pHYs
    density of 48,000 px/m (≈1219 ppi), so Photoshop, Illustrator and InDesign
    open both at the same physical size.
  - File names state the size, e.g. `fco-bz-s27-qr-14.5mm.svg`. The s27 output
    matches `publicity/fco-bz-s27-qr-0p5mm-q4.svg` module for module.
- **Header:** the signed-in email (from Access) and a sign-out link.

## Access (Zero Trust)

- **Access application:** "fco.bz admin" for `admin.fco.bz`, session 24 hours.
- **Login methods:** One-time PIN (exists already) and Google (new). Google
  needs an OAuth client from Google Cloud, made by the user, with the redirect
  URI `https://furrycolombia.cloudflareaccess.com/cdn-cgi/access/callback`.
- **Policy:** allow the Access group "fco.bz admins".
- **The allow-list lives outside git.** It's a GitHub secret,
  `LINKS_ADMIN_EMAILS` (comma-separated), synced into `.secrets` like the
  rest. `pnpm links:access` is an idempotent script that creates or updates
  the group, policy, app and Google login method from it. To add someone,
  update the secret and rerun the script.

## Repository layout

```
apps/links/
├── worker/              # fetch handler: redirect, click capture, /api, JWT check
│   ├── redirect.ts      # slug lookup, 302, miss handling
│   ├── capture.ts       # request → click row (cf geo, UA parse, bot/preview, hash)
│   ├── api.ts           # links list, stats queries, sync status / sync now
│   ├── sheet.ts         # Google Sheets client (service-account JWT via WebCrypto)
│   ├── sync.ts          # Sheet → D1 with validation; nightly summary → Sheet
│   ├── backup.ts        # raw-clicks CSV: /api/export.csv + optional weekly R2 export
│   ├── rollup.ts        # hourly clicks → daily_stats
│   ├── linkCache.ts     # Cache API snapshot of links, stale-on-error
│   └── access.ts        # Cf-Access-Jwt-Assertion verification
├── migrations/          # D1 SQL migrations
├── src/                 # dashboard SPA (flat, like sunfest2027)
├── scripts/access.mjs   # pnpm links:access
└── wrangler.toml        # routes: fco.bz, admin.fco.bz (custom domains); D1 binding
```

Commands: `pnpm dev:links`, `pnpm test:links`, `pnpm build:links`,
`pnpm deploy:links`, `pnpm links:access`. The CLAUDE.md deployment table gains
the `fco-links` row.

Dependencies: `ua-parser-js` **1.x** (MIT; 2.x is AGPL), a small bot and
preview User-Agent list kept in the repo, `jose` for JWT verification, and a
chart library chosen when the dashboard is built.

## Secrets

| Name                            | Where                         | Purpose                                 |
| ------------------------------- | ----------------------------- | --------------------------------------- |
| `VISITOR_HASH_KEY`              | Worker secret                 | HMAC key for the daily visitor hash     |
| `ACCESS_AUD`, `ACCESS_TEAM`     | Worker vars                   | JWT audience/issuer check               |
| `LINKS_ADMIN_EMAILS`            | GitHub secret → `.secrets`    | Zero Trust allow-list                   |
| `GOOGLE_OAUTH_CLIENT_ID/SECRET` | GitHub secret → `.secrets`    | Google login method for Access          |
| `GOOGLE_SERVICE_ACCOUNT_JSON`   | Worker secret + GitHub secret | Read and write the links Sheet          |
| `LINKS_SHEET_ID`                | Worker var                    | Which Sheet to sync (an ID, not secret) |

## Testing

- **Unit (Vitest):**
  - Click capture from fixture requests: geo fields, UA parsing, bot and
    preview classification, the hash rotating by day, UTM extraction.
  - Slug validation; redirect status and headers; miss handling.
  - Sheet sync rules, from fixture rows: invalid rows keep the last good
    version, duplicates, deleted rows stay live, `active` off, status
    write-back.
  - Access JWT verification: valid, expired, wrong audience, missing.
  - API handlers against a local D1 (Miniflare).
- **Dashboard:** component tests with i18n keys, per repo rules.
- **Live checks after deploy:**
  - `curl -I fco.bz/s27` returns a 302 to `sunfest2027.furrycolombia.com`.
  - `admin.fco.bz` without a session shows the Access login, and `/api`
    without a JWT returns 401.
  - A test click appears in the dashboard.

## First link

`s27` → `https://sunfest2027.furrycolombia.com`, campaign `sunfest2027`. It
points at the year-stamped host on purpose: when Sunfest 2027 concludes and
that host becomes the archive, the printed `fco.bz/s27` freezes on the 2027
edition, matching the CLAUDE.md publicity rule.

## Scanner traffic (added after launch)

Within an hour of going live, about 140 of the first 147 logged requests were
vulnerability scanners probing paths like `/.env`, `/.git` and `/config.json`.
This is normal for a new domain, which shows up in Certificate Transparency
logs. They redirected harmlessly, but they polluted the "misses" stats and
spent the daily D1 write allowance. Three layers now handle them:

1. **Firewall rule** (`pnpm links:waf`, Cloudflare Free custom rules, no
   regex). On fco.bz it blocks any path containing `.` (except
   `/favicon.ico`) and `RESERVED_SLUGS` (`/api`, `/config`, `/env`,
   `/wp-admin`, …), returning a 403 at the edge. Blocked requests cost no
   Worker request and no D1 write.
2. **The Worker** redirects paths that are not well-formed slugs without
   logging them.
3. **The Sheet sync** rejects reserved slugs with the status "✗ slug
   reservado".

`RESERVED_SLUGS` lives in `worker/slug.ts`; the firewall script reads it from
there.

**Account limit to keep in mind:** Workers Free allows 100,000 requests a day
**per account**, shared with the `eclipse-con` Worker. Past it, fco.bz returns
error 1027 until midnight UTC; a custom domain has no origin to fail open to.
Move to Workers Paid ($5/month) before QR codes go out at scale.

## Out of scope (for now)

Public stats pages, link expiry, password-protected links, A/B destinations,
geo- or device-based routing, raw-click retention limits, and a visitor-facing
privacy notice. Each can be added later without changing the data model.
