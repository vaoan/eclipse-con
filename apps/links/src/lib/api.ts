import type {
  LinksResponse,
  Me,
  Scope,
  StatsResponse,
  SyncResponse,
} from "@/types";

/** Thrown for any non-2xx API answer; `status` drives the error copy. */
export class ApiError extends Error {
  /**
   * @param status - HTTP status.
   * @param path - Request path, for the console.
   */
  constructor(
    readonly status: number,
    path: string
  ) {
    super(`API ${path} answered ${status}`);
  }
}

/** GET JSON from the Worker API. */
async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(path, { signal, credentials: "same-origin" });
  if (!response.ok) {
    throw new ApiError(response.status, path);
  }
  return (await response.json()) as T;
}

/**
 * Query string for a scope and date range.
 *
 * @param scope - All links, one slug or one campaign.
 * @param from - `YYYY-MM-DD`.
 * @param to - `YYYY-MM-DD`.
 * @returns e.g. `slug=s27&from=…&to=…`.
 */
export function statsQuery(scope: Scope, from: string, to: string): string {
  const query = new URLSearchParams({ from, to });
  if (scope.kind === "slug") {
    query.set("slug", scope.slug);
  } else if (scope.kind === "campaign") {
    query.set("campaign", scope.campaign);
  }
  return query.toString();
}

/** Signed-in identity and the Sheet link. */
export function fetchMe(signal?: AbortSignal): Promise<Me> {
  return getJson("/api/me", signal);
}

/** Every link with totals and sparklines. */
export function fetchLinks(signal?: AbortSignal): Promise<LinksResponse> {
  return getJson("/api/links", signal);
}

/** Aggregated stats for a scope and range. */
export function fetchStats(
  scope: Scope,
  from: string,
  to: string,
  signal?: AbortSignal
): Promise<StatsResponse> {
  return getJson(`/api/stats?${statsQuery(scope, from, to)}`, signal);
}

/** Sync status. */
export function fetchSync(signal?: AbortSignal): Promise<SyncResponse> {
  return getJson("/api/sync", signal);
}

/** Run a Sheet sync now. */
export async function syncNow(): Promise<void> {
  const response = await fetch("/api/sync", {
    method: "POST",
    headers: { "x-requested-with": "fetch" },
    credentials: "same-origin",
  });
  if (!response.ok) {
    throw new ApiError(response.status, "/api/sync");
  }
}

/**
 * Downloads every raw click in the range as one CSV: walks
 * `/api/export.csv` page by page (`X-Next-After`) and joins the pages.
 *
 * @param from - `YYYY-MM-DD`.
 * @param to - `YYYY-MM-DD`.
 * @returns The CSV text.
 */
export async function exportCsv(from: string, to: string): Promise<string> {
  const parts: string[] = [];
  let after: string | null = null;
  do {
    const query = new URLSearchParams({ from, to });
    if (after !== null) {
      query.set("after", after);
    }
    const response = await fetch(`/api/export.csv?${query.toString()}`, {
      credentials: "same-origin",
    });
    if (!response.ok) {
      throw new ApiError(response.status, "/api/export.csv");
    }
    parts.push(await response.text());
    after = response.headers.get("x-next-after");
  } while (after !== null);
  return parts.join("");
}
