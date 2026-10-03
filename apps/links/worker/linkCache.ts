/** Where a slug points, as the redirect path needs it. */
export interface LinkTarget {
  /** Absolute https URL. */
  readonly destination: string;
  /** False when unticked in the Sheet; the slug then goes to the fallback. */
  readonly active: boolean;
}

/** Every link at one moment, with when it was read from D1. */
export interface LinkSnapshot {
  /** Read time, ms since epoch. */
  readonly fetchedAt: number;
  /** Targets keyed by slug. */
  readonly links: Readonly<Record<string, LinkTarget>>;
}

/** Synthetic Cache API key; never fetched over the network. */
const CACHE_KEY = "https://fco-links.internal/links-snapshot";
/** A snapshot younger than this is used without touching D1. */
export const FRESH_MS = 60_000;
/** How long the Cache API may keep a (stale) snapshot as the D1-down fallback. */
const KEEP_SECONDS = 7 * 24 * 60 * 60;

let memory: LinkSnapshot | null = null;

/** Forget the in-isolate copy (tests, and after a sync in this isolate). */
export function resetLinkMemory(): void {
  memory = null;
}

/** Read the snapshot from the Cache API, tolerating any failure. */
async function readCache(
  cache: Cache | undefined
): Promise<LinkSnapshot | null> {
  if (!cache) {
    return null;
  }
  try {
    const hit = await cache.match(CACHE_KEY);
    return hit ? await hit.json<LinkSnapshot>() : null;
  } catch {
    return null;
  }
}

/** Store the snapshot in the Cache API; best effort. */
async function writeCache(
  cache: Cache | undefined,
  snapshot: LinkSnapshot
): Promise<void> {
  if (!cache) {
    return;
  }
  try {
    await cache.put(
      CACHE_KEY,
      new Response(JSON.stringify(snapshot), {
        headers: {
          "content-type": "application/json",
          "cache-control": `max-age=${KEEP_SECONDS}`,
        },
      })
    );
  } catch {
    // Cache unavailable: memory and D1 still work.
  }
}

/** One D1 read of every link. */
async function readDatabase(
  database: D1Database,
  now: number
): Promise<LinkSnapshot> {
  const { results } = await database
    .prepare("SELECT slug, destination, active FROM links")
    .all<{ slug: string; destination: string; active: number }>();
  const links: Record<string, LinkTarget> = {};
  for (const row of results) {
    links[row.slug] = {
      destination: row.destination,
      active: row.active === 1,
    };
  }
  return { fetchedAt: now, links };
}

/**
 * The current link table for the redirect path: memory, then the Cache API
 * while fresh (60 s), then D1. If D1 errors — e.g. past its daily cap — the
 * newest stale copy is served instead, so printed links keep working.
 *
 * @param database - D1.
 * @param cache - `caches.default`, or undefined where there is none.
 * @param now - Clock, ms since epoch.
 * @returns The snapshot, or null only if D1 fails and nothing was ever cached.
 */
export async function loadLinks(
  database: D1Database,
  cache: Cache | undefined,
  now: number
): Promise<LinkSnapshot | null> {
  if (memory && now - memory.fetchedAt < FRESH_MS) {
    return memory;
  }
  const cached = await readCache(cache);
  if (cached && now - cached.fetchedAt < FRESH_MS) {
    memory = cached;
    return cached;
  }
  try {
    const fresh = await readDatabase(database, now);
    memory = fresh;
    await writeCache(cache, fresh);
    return fresh;
  } catch (error) {
    console.error("link lookup fell back to a stale snapshot", error);
    return memory ?? cached;
  }
}

/**
 * Re-reads D1 and replaces the cached snapshot. Called after a sync changed
 * links, so this colo serves the change at once (others within 60 s).
 *
 * @param database - D1.
 * @param cache - `caches.default`, or undefined.
 * @param now - Clock.
 * @returns Resolves when refreshed (errors are logged, not thrown).
 */
export async function refreshLinks(
  database: D1Database,
  cache: Cache | undefined,
  now: number
): Promise<void> {
  try {
    const fresh = await readDatabase(database, now);
    memory = fresh;
    await writeCache(cache, fresh);
  } catch (error) {
    console.error("link cache refresh failed", error);
  }
}
