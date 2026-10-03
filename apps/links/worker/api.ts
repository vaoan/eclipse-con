import type { AccessIdentity } from "./access";
import {
  clicksCsvStream,
  DEFAULT_PAGE_ROWS,
  idRangeFor,
  MAX_PAGE_ROWS,
  pageEnd,
} from "./backup";
import type { Env } from "./env";
import { DIMENSIONS, MISS_SLUG } from "./rollup";
import type { Fetcher } from "./sheet";
import { runSync } from "./sync";
import { bogotaDayOffset } from "./time";

/** Default stats window when the caller gives none. */
const DEFAULT_RANGE_DAYS = 30;
/** Rows returned per dimension breakdown. */
const TOP_VALUES = 100;
/** Days in the per-link sparkline. */
const SPARKLINE_DAYS = 30;
const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const NO_STORE = { "cache-control": "no-store" } as const;

/** Everything a handler needs. */
export interface ApiContext {
  readonly env: Env;
  readonly identity: AccessIdentity;
  readonly now: number;
  readonly fetcher: Fetcher;
  readonly cache: Cache | undefined;
}

/** A JSON response that is never cached. */
function json(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: NO_STORE });
}

/** Validated `from`/`to` (inclusive Bogotá dates) with defaults. */
export function dateRange(
  query: URLSearchParams,
  now: number
): { from: string; to: string } {
  const to = query.get("to") ?? "";
  const from = query.get("from") ?? "";
  const safeTo = DAY_PATTERN.test(to) ? to : bogotaDayOffset(now, 0);
  const safeFrom = DAY_PATTERN.test(from)
    ? from
    : bogotaDayOffset(now, -(DEFAULT_RANGE_DAYS - 1));
  return safeFrom <= safeTo
    ? { from: safeFrom, to: safeTo }
    : { from: safeTo, to: safeFrom };
}

/** `GET /api/me` — who is signed in, plus the Sheet link. */
function handleMe(context: ApiContext): Response {
  const sheetId = context.env.LINKS_SHEET_ID;
  return json({
    email: context.identity.email,
    serviceToken: context.identity.serviceToken,
    sheetUrl: sheetId
      ? `https://docs.google.com/spreadsheets/d/${sheetId}/edit`
      : null,
  });
}

/** `GET /api/links` — every link with lifetime totals and a 30-day sparkline. */
async function handleLinks(context: ApiContext): Promise<Response> {
  const database = context.env.DB;
  const since = bogotaDayOffset(context.now, -(SPARKLINE_DAYS - 1));
  const [links, spark, misses] = await Promise.all([
    database
      .prepare(
        `SELECT l.slug, l.destination, l.label, l.campaign, l.active, l.in_sheet,
           l.sheet_row, l.first_seen, l.updated_at,
           COALESCE(s.clicks, 0) AS clicks, COALESCE(s.uniques, 0) AS uniques,
           COALESCE(s.bots, 0) AS bots, COALESCE(s.previews, 0) AS previews,
           s.last_click_at
         FROM links l LEFT JOIN link_stats s ON s.slug = l.slug
         ORDER BY l.campaign, l.slug`
      )
      .all(),
    database
      .prepare(
        `SELECT slug, date, clicks FROM daily_stats
         WHERE dim = 'total' AND date >= ? AND slug != ?`
      )
      .bind(since, MISS_SLUG)
      .all<{ slug: string; date: string; clicks: number }>(),
    database
      .prepare(
        `SELECT value AS slug, SUM(clicks) AS clicks FROM daily_stats
         WHERE slug = ? AND dim = 'requested' AND date >= ?
         GROUP BY value ORDER BY clicks DESC LIMIT 20`
      )
      .bind(MISS_SLUG, since)
      .all(),
  ]);
  return json({
    links: links.results,
    sparkline: { since, rows: spark.results },
    misses: misses.results,
  });
}

/** Slugs a stats request covers: one slug, a campaign, or everything. */
async function resolveSlugs(
  database: D1Database,
  query: URLSearchParams
): Promise<string[] | null> {
  const slug = query.get("slug");
  if (slug) {
    return [slug.toLowerCase()];
  }
  const campaign = query.get("campaign");
  if (campaign) {
    const { results } = await database
      .prepare("SELECT slug FROM links WHERE campaign = ?")
      .bind(campaign.toLowerCase())
      .all<{ slug: string }>();
    return results.map((row) => row.slug);
  }
  return null;
}

/** `GET /api/stats` — series, hours and every dimension for a range. */
async function handleStats(
  context: ApiContext,
  query: URLSearchParams
): Promise<Response> {
  const database = context.env.DB;
  const { from, to } = dateRange(query, context.now);
  const slugs = await resolveSlugs(database, query);
  if (slugs?.length === 0) {
    return json({ from, to, series: [], hours: [], dims: {} });
  }
  const slugFilter =
    slugs === null
      ? "slug != ?"
      : `slug IN (${slugs.map(() => "?").join(", ")})`;
  const slugValues = slugs ?? [MISS_SLUG];
  const where = `date >= ? AND date <= ? AND ${slugFilter}`;
  const sums =
    "SUM(clicks) AS clicks, SUM(uniques) AS uniques, SUM(bots) AS bots, SUM(previews) AS previews";
  const select = (sql: string) =>
    database
      .prepare(sql)
      .bind(from, to, ...slugValues)
      .all();

  const dimensionNames = Object.keys(DIMENSIONS).filter(
    (dim) => dim !== "hour"
  );
  const [series, hours, ...breakdowns] = await Promise.all([
    select(
      `SELECT date, ${sums} FROM daily_stats WHERE dim = 'total' AND ${where}
       GROUP BY date ORDER BY date`
    ),
    select(
      `SELECT date, value AS hour, ${sums} FROM daily_stats WHERE dim = 'hour' AND ${where}
       GROUP BY date, value ORDER BY date, value`
    ),
    ...dimensionNames.map((dim) =>
      select(
        `SELECT value, ${sums} FROM daily_stats WHERE dim = '${dim}' AND ${where}
         GROUP BY value ORDER BY SUM(clicks + bots + previews) DESC LIMIT ${TOP_VALUES}`
      )
    ),
  ]);
  const dims = Object.fromEntries(
    dimensionNames.map((dim, index) => [dim, breakdowns[index]?.results ?? []])
  );
  return json({
    from,
    to,
    slugs,
    series: series.results,
    hours: hours.results,
    dims,
  });
}

/** `GET /api/sync` — latest sync state, history and slugs missing from the Sheet. */
async function handleSyncStatus(context: ApiContext): Promise<Response> {
  const database = context.env.DB;
  const [state, runs, missing] = await Promise.all([
    database.prepare("SELECT * FROM sync_state WHERE id = 1").first(),
    database.prepare("SELECT * FROM sync_runs ORDER BY id DESC LIMIT 20").all(),
    database
      .prepare(
        "SELECT slug, destination FROM links WHERE in_sheet = 0 ORDER BY slug"
      )
      .all(),
  ]);
  const rollup = await database
    .prepare("SELECT ran_at FROM rollup_cursor WHERE id = 1")
    .first<number | null>("ran_at");
  return json({
    state,
    runs: runs.results,
    missing: missing.results,
    statsUpdatedAt: rollup,
  });
}

/** `POST /api/sync` — run a sync now. */
async function handleSyncNow(context: ApiContext): Promise<Response> {
  const result = await runSync(context.env, {
    now: context.now,
    fetcher: context.fetcher,
    cache: context.cache,
  });
  return json(result, result.ok || result.skipped ? 200 : 502);
}

/** Epoch ms of a Bogotá date's midnight. */
function bogotaMidnight(day: string): number {
  return Date.parse(`${day}T00:00:00-05:00`);
}

/**
 * `GET /api/export.csv?from=&to=&after=&limit=` — raw clicks as CSV, one page
 * per response (5,000 rows by default). `X-Next-After` carries the cursor for
 * the next page; absent on the last. Works for people and Access service
 * tokens alike.
 */
async function handleExport(
  context: ApiContext,
  query: URLSearchParams
): Promise<Response> {
  const database = context.env.DB;
  const { from, to } = dateRange(query, context.now);
  const range = await idRangeFor(
    database,
    bogotaMidnight(from),
    bogotaMidnight(to) + 86_400_000
  );
  const headers: Record<string, string> = {
    "content-type": "text/csv; charset=utf-8",
    "content-disposition": `attachment; filename="fco-clicks-${from}_${to}.csv"`,
    ...NO_STORE,
  };
  const afterParameter = Number.parseInt(query.get("after") ?? "", 10);
  const limitParameter = Number.parseInt(query.get("limit") ?? "", 10);
  const limit = Number.isFinite(limitParameter)
    ? Math.min(Math.max(limitParameter, 1), MAX_PAGE_ROWS)
    : DEFAULT_PAGE_ROWS;
  const isFirstPage = !Number.isFinite(afterParameter);
  if (!range) {
    return new Response(isFirstPage ? "id\n" : "", { headers });
  }
  const after = isFirstPage
    ? range.after
    : Math.max(afterParameter, range.after);
  const page = await pageEnd(database, range, after, limit);
  if (page.next !== null) {
    headers["x-next-after"] = String(page.next);
  }
  return new Response(
    clicksCsvStream(database, after, page.upto, isFirstPage),
    {
      headers,
    }
  );
}

/**
 * Routes `/api/*` for an authenticated caller. POSTs must carry
 * `X-Requested-With: fetch`, which a cross-site form cannot set (CSRF guard
 * on top of Access's SameSite cookie).
 *
 * @param request - Incoming request.
 * @param context - Env, identity, clock, fetch and cache.
 * @returns The API response.
 */
export async function handleApi(
  request: Request,
  context: ApiContext
): Promise<Response> {
  const url = new URL(request.url);
  const route = `${request.method} ${url.pathname}`;
  if (
    request.method === "POST" &&
    request.headers.get("x-requested-with") !== "fetch"
  ) {
    return json({ error: "missing_x_requested_with" }, 403);
  }
  switch (route) {
    case "GET /api/me": {
      return handleMe(context);
    }
    case "GET /api/links": {
      return handleLinks(context);
    }
    case "GET /api/stats": {
      return handleStats(context, url.searchParams);
    }
    case "GET /api/sync": {
      return handleSyncStatus(context);
    }
    case "POST /api/sync": {
      return handleSyncNow(context);
    }
    case "GET /api/export.csv": {
      return handleExport(context, url.searchParams);
    }
    default: {
      return json({ error: "not_found" }, 404);
    }
  }
}
