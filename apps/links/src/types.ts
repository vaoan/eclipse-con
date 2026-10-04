/** Human clicks, unique visitors, bot hits and link-preview fetches. */
export interface Counts {
  readonly clicks: number;
  readonly uniques: number;
  readonly bots: number;
  readonly previews: number;
}

/** `GET /api/me`. */
export interface Me {
  readonly email: string | null;
  readonly serviceToken: string | null;
  readonly sheetUrl: string | null;
}

/** One link with its lifetime totals (`GET /api/links`). */
export interface LinkRow extends Counts {
  readonly slug: string;
  readonly destination: string;
  readonly label: string | null;
  readonly campaign: string | null;
  readonly active: number;
  readonly in_sheet: number;
  readonly sheet_row: number | null;
  readonly first_seen: number;
  readonly updated_at: number;
  readonly last_click_at: number | null;
}

/** `GET /api/links`. */
export interface LinksResponse {
  readonly links: readonly LinkRow[];
  readonly sparkline: {
    readonly since: string;
    readonly rows: readonly { slug: string; date: string; clicks: number }[];
  };
  readonly misses: readonly { slug: string; clicks: number }[];
}

/** A day of totals. */
export interface DayPoint extends Counts {
  readonly date: string;
}

/** An hour of totals (`hour` is `"00"`–`"23"`, Bogotá time). */
export interface HourPoint extends Counts {
  readonly date: string;
  readonly hour: string;
}

/** One value of a dimension breakdown. */
export interface BreakdownRow extends Counts {
  readonly value: string;
}

/** `GET /api/stats`. */
export interface StatsResponse {
  readonly from: string;
  readonly to: string;
  readonly slugs: readonly string[] | null;
  readonly series: readonly DayPoint[];
  readonly hours: readonly HourPoint[];
  readonly dims: Readonly<Record<string, readonly BreakdownRow[]>>;
}

/** A Sheet row the sync rejected. */
export interface RowError {
  readonly row: number;
  readonly slug: string;
  readonly reason: string;
}

/** `GET /api/sync`. */
export interface SyncResponse {
  readonly state: {
    readonly ran_at: number | null;
    readonly ok: number | null;
    readonly rows: number | null;
    readonly changed: number | null;
    readonly errors: string | null;
    readonly message: string | null;
  } | null;
  readonly missing: readonly { slug: string; destination: string }[];
  readonly statsUpdatedAt: number | null;
}

/** What the stats view is scoped to. */
export type Scope =
  | { readonly kind: "all" }
  | { readonly kind: "slug"; readonly slug: string }
  | { readonly kind: "campaign"; readonly campaign: string };
