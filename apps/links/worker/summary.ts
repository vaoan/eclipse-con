import type { Env } from "./env";
import { MISS_SLUG } from "./rollup";
import { openSheet, type CellValue, type Fetcher } from "./sheet";
import { bogotaDayOffset } from "./time";

/** Where the nightly summary is appended (date, slug, country, clicks, uniques). */
export const SUMMARY_RANGE = "Clicks by day!A:E";

/**
 * Appends yesterday's (Bogotá) human clicks per slug and country to the
 * Sheet's "Clicks by day" tab: a readable backup of the numbers. Guarded by
 * `job_state` so a retried night never appends the same day twice.
 *
 * @param env - Worker env.
 * @param now - Clock, ms.
 * @param fetcher - `fetch`.
 * @returns Rows appended (0 when skipped or already done).
 */
export async function runNightlySummary(
  env: Env,
  now: number,
  fetcher: Fetcher
): Promise<number> {
  const day = bogotaDayOffset(now, -1);
  const done = await env.DB.prepare(
    "SELECT detail FROM job_state WHERE name = 'summary'"
  ).first<string | null>("detail");
  if (done === day) {
    return 0;
  }
  const sheet = await openSheet(
    env.LINKS_SHEET_ID,
    env.GOOGLE_SERVICE_ACCOUNT_JSON,
    now,
    fetcher
  );
  if (!sheet) {
    return 0;
  }
  const { results } = await env.DB.prepare(
    `SELECT slug, value AS country, clicks, uniques FROM daily_stats
     WHERE date = ? AND dim = 'country' AND slug != ? AND clicks > 0
     ORDER BY slug, clicks DESC`
  )
    .bind(day, MISS_SLUG)
    .all<{ slug: string; country: string; clicks: number; uniques: number }>();
  const rows: CellValue[][] = results.map((row) => [
    day,
    row.slug,
    row.country,
    row.clicks,
    row.uniques,
  ]);
  await sheet.append(SUMMARY_RANGE, rows);
  await env.DB.prepare(
    `INSERT INTO job_state (name, last_at, detail) VALUES ('summary', ?, ?)
     ON CONFLICT (name) DO UPDATE SET last_at = excluded.last_at, detail = excluded.detail`
  )
    .bind(now, day)
    .run();
  return rows.length;
}
