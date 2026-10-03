import type { Env } from "./env";
import { refreshLinks } from "./linkCache";
import { openSheet, type CellValue, type Fetcher } from "./sheet";
import { RESERVED_SLUGS, isHttpsUrl, isValidSlug } from "./slug";

/** Data rows of the Links tab (row 1 is the header). */
export const LINKS_RANGE = "Links!A2:F";
/** First data row number, for status write-back addresses. */
const FIRST_ROW = 2;
/** Column the sync writes its per-row verdict into. */
const STATUS_COLUMN = "F";

/** Verdicts written back to the Sheet, in Spanish for the people editing it. */
export const STATUS = {
  live: "✓ activo",
  paused: "⏸ pausado: va a furrycolombia.com",
  badSlug: "✗ slug inválido: solo minúsculas, números o guiones (máx. 32)",
  reservedSlug: "✗ slug reservado (lo bloquea el firewall): elige otro",
  badDestination: "✗ destino inválido: debe empezar con https://",
  duplicate: (row: number) => `✗ slug repetido: ya está en la fila ${row}`,
  keptPrevious: " — sigue activo el destino anterior",
} as const;

/** One row of the Links tab, as typed by a person. */
export interface SheetRow {
  /** 1-based sheet row number. */
  readonly row: number;
  readonly slug: string;
  readonly destination: string;
  readonly label: string;
  readonly campaign: string;
  readonly active: boolean;
  /** What the previous sync wrote in the status column. */
  readonly status: string;
}

/** A link as stored in D1. */
export interface StoredLink {
  readonly slug: string;
  readonly destination: string;
  readonly label: string | null;
  readonly campaign: string | null;
  readonly active: number;
  readonly in_sheet: number;
  readonly sheet_row: number | null;
}

/** A row problem, shown in the dashboard's sync panel. */
export interface RowError {
  readonly row: number;
  readonly slug: string;
  readonly reason: string;
}

/** What one sync should change. Pure output of {@link planSync}. */
export interface SyncPlan {
  /** Links to insert or update (only those that differ from D1). */
  readonly upserts: readonly Omit<StoredLink, "in_sheet">[];
  /** Slugs live in D1 but gone from the Sheet: marked in_sheet = 0, kept live. */
  readonly missing: readonly string[];
  /** Status cells that need a new value. */
  readonly statuses: readonly { row: number; status: string }[];
  /** Rejected rows. */
  readonly errors: readonly RowError[];
  /** Non-blank rows read. */
  readonly rows: number;
}

/** A cell as trimmed text. */
function cellText(value: CellValue | undefined): string {
  return value === undefined ? "" : String(value).trim();
}

/** Checkbox semantics; an empty cell (no checkbox) counts as active. */
function cellActive(value: CellValue | undefined): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  const normalized = cellText(value).toLowerCase();
  return !["false", "falso", "no", "0"].includes(normalized);
}

/**
 * Turns raw Sheet values into rows, skipping fully blank lines.
 *
 * @param values - From `getValues(LINKS_RANGE)`.
 * @returns Typed rows with their sheet row numbers.
 */
export function parseSheetRows(values: readonly CellValue[][]): SheetRow[] {
  const rows: SheetRow[] = [];
  for (const [index, cells] of values.entries()) {
    const [slug, destination, label, campaign, active, status] = cells;
    if (cellText(slug) === "" && cellText(destination) === "") {
      continue;
    }
    rows.push({
      row: index + FIRST_ROW,
      slug: cellText(slug).toLowerCase(),
      destination: cellText(destination),
      label: cellText(label),
      campaign: cellText(campaign).toLowerCase(),
      active: cellActive(active),
      status: cellText(status),
    });
  }
  return rows;
}

/** Whether a valid row differs from what D1 holds. */
function differs(row: SheetRow, stored: StoredLink | undefined): boolean {
  if (!stored) {
    return true;
  }
  return (
    stored.destination !== row.destination ||
    (stored.label ?? "") !== row.label ||
    (stored.campaign ?? "") !== row.campaign ||
    (stored.active === 1) !== row.active ||
    stored.in_sheet !== 1 ||
    stored.sheet_row !== row.row
  );
}

/** The rejection reason for a row, or null when it is valid. */
function rejection(
  row: SheetRow,
  firstRowBySlug: ReadonlyMap<string, number>
): string | null {
  if (!isValidSlug(row.slug)) {
    return RESERVED_SLUGS.includes(row.slug)
      ? STATUS.reservedSlug
      : STATUS.badSlug;
  }
  const firstRow = firstRowBySlug.get(row.slug);
  if (firstRow !== undefined && firstRow !== row.row) {
    return STATUS.duplicate(firstRow);
  }
  if (!isHttpsUrl(row.destination)) {
    return STATUS.badDestination;
  }
  return null;
}

/** What one row contributes to a plan. */
interface RowVerdict {
  readonly status: string;
  readonly upsert: Omit<StoredLink, "in_sheet"> | null;
  readonly error: RowError | null;
}

/** Judge one row: its status text, and an upsert or an error. */
function judgeRow(
  row: SheetRow,
  firstRowBySlug: ReadonlyMap<string, number>,
  storedBySlug: ReadonlyMap<string, StoredLink>
): RowVerdict {
  const reason = rejection(row, firstRowBySlug);
  if (reason !== null) {
    const keepsOld =
      storedBySlug.has(row.slug) && firstRowBySlug.get(row.slug) === row.row;
    return {
      status: keepsOld ? `${reason}${STATUS.keptPrevious}` : reason,
      upsert: null,
      error: { row: row.row, slug: row.slug, reason },
    };
  }
  const changed = differs(row, storedBySlug.get(row.slug));
  return {
    status: row.active ? STATUS.live : STATUS.paused,
    upsert: changed
      ? {
          slug: row.slug,
          destination: row.destination,
          label: row.label || null,
          campaign: row.campaign || null,
          active: row.active ? 1 : 0,
          sheet_row: row.row,
        }
      : null,
    error: null,
  };
}

/**
 * Decides what a sync changes. The rules protect printed links:
 * an invalid row never overwrites the last good destination; with duplicate
 * slugs the first row wins; a deleted row keeps its link live (flagged as
 * missing); only unticking `active` stops a link.
 *
 * @param rows - Parsed Sheet rows.
 * @param stored - Current D1 links.
 * @returns The plan.
 */
export function planSync(
  rows: readonly SheetRow[],
  stored: readonly StoredLink[]
): SyncPlan {
  const storedBySlug = new Map(stored.map((link) => [link.slug, link]));
  const firstRowBySlug = new Map<string, number>();
  for (const row of rows) {
    if (isValidSlug(row.slug) && !firstRowBySlug.has(row.slug)) {
      firstRowBySlug.set(row.slug, row.row);
    }
  }

  const upserts: Omit<StoredLink, "in_sheet">[] = [];
  const statuses: { row: number; status: string }[] = [];
  const errors: RowError[] = [];

  for (const row of rows) {
    const verdict = judgeRow(row, firstRowBySlug, storedBySlug);
    if (verdict.upsert) {
      upserts.push(verdict.upsert);
    }
    if (verdict.error) {
      errors.push(verdict.error);
    }
    if (verdict.status !== row.status) {
      statuses.push({ row: row.row, status: verdict.status });
    }
  }

  const missing = stored
    .filter((link) => link.in_sheet === 1 && !firstRowBySlug.has(link.slug))
    .map((link) => link.slug);

  return { upserts, missing, statuses, errors, rows: rows.length };
}

/** Outcome of one {@link runSync}. */
export interface SyncResult {
  readonly ok: boolean;
  /** True when the Sheet or service account is not configured yet. */
  readonly skipped: boolean;
  readonly rows: number;
  readonly changed: number;
  readonly errors: readonly RowError[];
  readonly message: string | null;
}

/** Applies a plan to D1 in one transaction. */
async function applyPlan(
  database: D1Database,
  plan: SyncPlan,
  now: number
): Promise<void> {
  const statements = [
    ...plan.upserts.map((link) =>
      database
        .prepare(
          `INSERT INTO links (slug, destination, label, campaign, active, in_sheet, sheet_row, first_seen, updated_at)
           VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)
           ON CONFLICT (slug) DO UPDATE SET destination = excluded.destination,
             label = excluded.label, campaign = excluded.campaign,
             active = excluded.active, in_sheet = 1,
             sheet_row = excluded.sheet_row, updated_at = excluded.updated_at`
        )
        .bind(
          link.slug,
          link.destination,
          link.label,
          link.campaign,
          link.active,
          link.sheet_row,
          now,
          now
        )
    ),
    ...plan.missing.map((slug) =>
      database
        .prepare("UPDATE links SET in_sheet = 0, updated_at = ? WHERE slug = ?")
        .bind(now, slug)
    ),
  ];
  if (statements.length > 0) {
    await database.batch(statements);
  }
}

/** Records the run: always the state row; history only when it mattered. */
async function recordRun(
  database: D1Database,
  result: SyncResult,
  now: number
): Promise<void> {
  const errors = JSON.stringify(result.errors);
  const previous = await database
    .prepare("SELECT errors, ok FROM sync_state WHERE id = 1")
    .first<{ errors: string | null; ok: number | null }>();
  const noteworthy =
    result.changed > 0 ||
    previous?.errors !== errors ||
    previous.ok !== (result.ok ? 1 : 0);
  const statements = [
    database
      .prepare(
        "UPDATE sync_state SET ran_at = ?, ok = ?, rows = ?, changed = ?, errors = ?, message = ? WHERE id = 1"
      )
      .bind(
        now,
        result.ok ? 1 : 0,
        result.rows,
        result.changed,
        errors,
        result.message
      ),
  ];
  if (noteworthy && !result.skipped) {
    statements.push(
      database
        .prepare(
          "INSERT INTO sync_runs (ts, ok, rows, changed, errors) VALUES (?, ?, ?, ?, ?)"
        )
        .bind(now, result.ok ? 1 : 0, result.rows, result.changed, errors)
    );
  }
  await database.batch(statements);
}

/** Dependencies {@link runSync} takes from the runtime. */
export interface SyncDeps {
  readonly now: number;
  readonly fetcher: Fetcher;
  readonly cache: Cache | undefined;
}

/**
 * One Sheet → D1 sync: read the Links tab, plan, apply, write the changed
 * status cells back, refresh the redirect cache if links changed, and record
 * the outcome. Errors are caught and recorded — the next minute retries.
 *
 * @param env - Worker env.
 * @param deps - Clock, fetch and cache.
 * @returns What happened.
 */
export async function runSync(env: Env, deps: SyncDeps): Promise<SyncResult> {
  let result: SyncResult;
  try {
    const sheet = await openSheet(
      env.LINKS_SHEET_ID,
      env.GOOGLE_SERVICE_ACCOUNT_JSON,
      deps.now,
      deps.fetcher
    );
    if (!sheet) {
      result = {
        ok: false,
        skipped: true,
        rows: 0,
        changed: 0,
        errors: [],
        message: "not_configured",
      };
    } else {
      const rows = parseSheetRows(await sheet.getValues(LINKS_RANGE));
      const { results: stored } = await env.DB.prepare(
        "SELECT slug, destination, label, campaign, active, in_sheet, sheet_row FROM links"
      ).all<StoredLink>();
      const plan = planSync(rows, stored);
      await applyPlan(env.DB, plan, deps.now);
      await sheet.batchUpdate(
        plan.statuses.map(({ row, status }) => ({
          range: `Links!${STATUS_COLUMN}${row}`,
          values: [[status]],
        }))
      );
      const changed = plan.upserts.length + plan.missing.length;
      if (changed > 0) {
        await refreshLinks(env.DB, deps.cache, deps.now);
      }
      result = {
        ok: true,
        skipped: false,
        rows: plan.rows,
        changed,
        errors: plan.errors,
        message: null,
      };
    }
  } catch (error) {
    console.error("sheet sync failed", error);
    result = {
      ok: false,
      skipped: false,
      rows: 0,
      changed: 0,
      errors: [],
      message: error instanceof Error ? error.message : String(error),
    };
  }
  try {
    await recordRun(env.DB, result, deps.now);
  } catch (error) {
    console.error("recording the sync run failed", error);
  }
  return result;
}
