/** Pseudo-slug under which unknown-slug requests are aggregated. */
export const MISS_SLUG = "~miss";

/**
 * Dimensions rolled into `daily_stats`, each with the SQL expression for its
 * value. Region and city carry their country (`CO|Antioquia`) because the
 * same name exists in several countries.
 */
export const DIMENSIONS = {
  hour: "printf('%02d', hour)",
  country: "COALESCE(country, '')",
  region: "COALESCE(country, '') || '|' || COALESCE(region, '')",
  city: "COALESCE(country, '') || '|' || COALESCE(city, '')",
  device: "COALESCE(device, '')",
  os: "COALESCE(os, '')",
  browser: "COALESCE(browser, '')",
  lang: "COALESCE(lang, '')",
  as_org: "COALESCE(as_org, '')",
  referrer_host: "COALESCE(referrer_host, '')",
  utm_source: "COALESCE(utm_source, '')",
  utm_medium: "COALESCE(utm_medium, '')",
  utm_campaign: "COALESCE(utm_campaign, '')",
  preview_app: "COALESCE(preview_app, '')",
} as const;

/** A dimension name stored in `daily_stats.dim` (plus the `total` row). */
export type Dimension = keyof typeof DIMENSIONS;

/** Largest id range folded in one run, keeping each run's D1 reads bounded. */
const MAX_BATCH = 20_000;

/** Upsert clause adding new counts onto an existing `daily_stats` row. */
const ADD_COUNTS = `ON CONFLICT (date, slug, dim, value) DO UPDATE SET
  clicks = clicks + excluded.clicks,
  uniques = uniques + excluded.uniques,
  bots = bots + excluded.bots,
  previews = previews + excluded.previews`;

/** INSERT … SELECT for one dimension over an id range (?1 = after, ?2 = upto). */
function dimensionStatement(dim: string, valueSql: string): string {
  return `INSERT INTO daily_stats (date, slug, dim, value, clicks, uniques, bots, previews)
    SELECT day, slug, '${dim}', ${valueSql},
      SUM(human), SUM(is_first), SUM(is_bot), SUM(is_preview)
    FROM clicks WHERE id > ?1 AND id <= ?2 AND miss = 0
    GROUP BY day, slug, ${valueSql}
    ${ADD_COUNTS}`;
}

/** Outcome of a rollup run. */
export interface RollupResult {
  /** Click ids folded: (from, to]. */
  readonly from: number;
  readonly to: number;
}

/**
 * Folds clicks newer than the cursor into `daily_stats` and `link_stats`.
 * Everything is additive (`is_first` already counts uniques at capture), so
 * each click is read once per dimension in its lifetime and the work happens
 * in SQL, not in Worker CPU. All statements and the cursor move run in one
 * batch, i.e. one transaction: a failed run changes nothing and is retried.
 *
 * @param database - D1.
 * @param now - Clock, ms.
 * @returns The id range folded (empty when there was nothing new).
 */
export async function runRollup(
  database: D1Database,
  now: number
): Promise<RollupResult> {
  const cursor = await database
    .prepare("SELECT last_click_id AS id FROM rollup_cursor WHERE id = 1")
    .first<number>("id");
  const after = cursor ?? 0;
  const newest = await database
    .prepare("SELECT MAX(id) AS id FROM clicks")
    .first<number | null>("id");
  if (newest === null || newest <= after) {
    await database
      .prepare("UPDATE rollup_cursor SET ran_at = ? WHERE id = 1")
      .bind(now)
      .run();
    return { from: after, to: after };
  }
  const upto = Math.min(newest, after + MAX_BATCH);

  const statements = [
    database.prepare(dimensionStatement("total", "''")).bind(after, upto),
    ...Object.entries(DIMENSIONS).map(([dim, valueSql]) =>
      database.prepare(dimensionStatement(dim, valueSql)).bind(after, upto)
    ),
    database
      .prepare(
        `INSERT INTO daily_stats (date, slug, dim, value, clicks, uniques, bots, previews)
         SELECT day, '${MISS_SLUG}', 'requested', slug, COUNT(*), 0, 0, 0
         FROM clicks WHERE id > ?1 AND id <= ?2 AND miss = 1
         GROUP BY day, slug
         ${ADD_COUNTS}`
      )
      .bind(after, upto),
    database
      .prepare(
        `INSERT INTO link_stats (slug, clicks, uniques, bots, previews, last_click_at)
         SELECT slug, SUM(human), SUM(is_first), SUM(is_bot), SUM(is_preview), MAX(ts)
         FROM clicks WHERE id > ?1 AND id <= ?2 AND miss = 0
         GROUP BY slug
         ON CONFLICT (slug) DO UPDATE SET
           clicks = clicks + excluded.clicks,
           uniques = uniques + excluded.uniques,
           bots = bots + excluded.bots,
           previews = previews + excluded.previews,
           last_click_at = MAX(COALESCE(last_click_at, 0), excluded.last_click_at)`
      )
      .bind(after, upto),
    database
      .prepare(
        "UPDATE rollup_cursor SET last_click_id = ?, ran_at = ? WHERE id = 1"
      )
      .bind(upto, now),
  ];
  await database.batch(statements);
  return { from: after, to: upto };
}
