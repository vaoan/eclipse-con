import { CLICK_COLUMNS } from "./capture";
import type { Env } from "./env";
import { bogotaDayOffset, isoWeek } from "./time";

/** Columns of the raw-clicks CSV, in order. */
export const EXPORT_COLUMNS = [
  "id",
  ...CLICK_COLUMNS,
  "human",
  "is_first",
] as const;

/** Rows per D1 query while exporting. */
const QUERY_ROWS = 2_000;
/** Default rows per `/api/export.csv` response (keeps Worker CPU small). */
export const DEFAULT_PAGE_ROWS = 5_000;
/** Upper bound a caller may ask for per response. */
export const MAX_PAGE_ROWS = 50_000;

/**
 * One CSV field, quoted when needed (RFC 4180).
 *
 * @param value - Cell value.
 * @returns The encoded field.
 */
export function csvField(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  const textValue =
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "bigint" ||
    typeof value === "boolean"
      ? String(value)
      : JSON.stringify(value);
  return /[",\n\r]/.test(textValue)
    ? `"${textValue.replaceAll('"', '""')}"`
    : textValue;
}

/** One CSV line for a row object. */
function csvLine(row: Record<string, unknown>): string {
  return `${EXPORT_COLUMNS.map((column) => csvField(row[column])).join(",")}\n`;
}

/** Click-id bounds of a time range, read through the `ts` index. */
export interface IdRange {
  /** Export ids strictly greater than this. */
  readonly after: number;
  /** …and at most this. */
  readonly upto: number;
}

/**
 * Turns `[fromTs, toTs)` into an id range with two indexed lookups, so paging
 * then walks the primary key instead of scanning by time.
 *
 * @param database - D1.
 * @param fromTs - Inclusive start, ms.
 * @param toTs - Exclusive end, ms.
 * @returns The range, or null when no click falls inside.
 */
export async function idRangeFor(
  database: D1Database,
  fromTs: number,
  toTs: number
): Promise<IdRange | null> {
  const first = await database
    .prepare("SELECT id FROM clicks WHERE ts >= ? ORDER BY ts LIMIT 1")
    .bind(fromTs)
    .first<number>("id");
  const last = await database
    .prepare("SELECT id FROM clicks WHERE ts < ? ORDER BY ts DESC LIMIT 1")
    .bind(toTs)
    .first<number>("id");
  if (first === null || last === null || last < first) {
    return null;
  }
  return { after: first - 1, upto: last };
}

/**
 * Where a page of `pageRows` starting after `after` ends, and whether more
 * follow.
 *
 * @param database - D1.
 * @param range - Overall id range.
 * @param after - Page start (exclusive).
 * @param pageRows - Rows wanted.
 * @returns Page end id and the next cursor (null on the last page).
 */
export async function pageEnd(
  database: D1Database,
  range: IdRange,
  after: number,
  pageRows: number
): Promise<{ upto: number; next: number | null }> {
  const end = await database
    .prepare(
      "SELECT id FROM clicks WHERE id > ? AND id <= ? ORDER BY id LIMIT 1 OFFSET ?"
    )
    .bind(after, range.upto, pageRows - 1)
    .first<number>("id");
  if (end === null || end >= range.upto) {
    return { upto: range.upto, next: null };
  }
  return { upto: end, next: end };
}

/**
 * Streams clicks with ids in `(after, upto]` as CSV, querying D1 in chunks of
 * 2,000 rows as the consumer reads.
 *
 * @param database - D1.
 * @param after - Exclusive start id.
 * @param upto - Inclusive end id.
 * @param withHeader - Emit the header line first.
 * @returns A byte stream of CSV.
 */
export function clicksCsvStream(
  database: D1Database,
  after: number,
  upto: number,
  withHeader: boolean
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let cursor = after;
  let headerPending = withHeader;
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      if (headerPending) {
        headerPending = false;
        controller.enqueue(encoder.encode(`${EXPORT_COLUMNS.join(",")}\n`));
        return;
      }
      const { results } = await database
        .prepare(
          `SELECT ${EXPORT_COLUMNS.join(", ")} FROM clicks
           WHERE id > ? AND id <= ? ORDER BY id LIMIT ?`
        )
        .bind(cursor, upto, QUERY_ROWS)
        .all();
      const last = results.at(-1);
      if (last === undefined) {
        controller.close();
        return;
      }
      cursor = Number(last.id);
      controller.enqueue(encoder.encode(results.map(csvLine).join("")));
      if (results.length < QUERY_ROWS || cursor >= upto) {
        controller.close();
      }
    },
  });
}

/**
 * Optional weekly export of last ISO week's raw clicks to R2 as gzip CSV
 * (`clicks/2026-W41.csv.gz`). Without a `BACKUP_BUCKET` binding — R2 is not
 * enabled on the account yet — it logs and skips.
 *
 * @param env - Worker env.
 * @param now - Clock, ms (runs Monday 07:00 UTC).
 * @returns The object key written, or null when skipped/empty.
 */
export async function runWeeklyExport(
  env: Env,
  now: number
): Promise<string | null> {
  if (!env.BACKUP_BUCKET) {
    console.warn("weekly export skipped: no BACKUP_BUCKET binding");
    return null;
  }
  const weekEnd = now - (now % 86_400_000);
  const weekStart = weekEnd - 7 * 86_400_000;
  const range = await idRangeFor(env.DB, weekStart, weekEnd);
  if (!range) {
    return null;
  }
  const key = `clicks/${isoWeek(bogotaDayOffset(now, -1))}.csv.gz`;
  const gzipped = clicksCsvStream(
    env.DB,
    range.after,
    range.upto,
    true
  ).pipeThrough(new CompressionStream("gzip"));
  // R2 needs a known length for a streamed body, so buffer the (small,
  // compressed) week first.
  const body = await new Response(gzipped).arrayBuffer();
  await env.BACKUP_BUCKET.put(key, body, {
    httpMetadata: { contentType: "text/csv", contentEncoding: "gzip" },
  });
  return key;
}
