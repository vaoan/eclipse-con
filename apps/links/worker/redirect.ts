import { buildClick, recordClick } from "./capture";
import { FALLBACK_URL, type Env } from "./env";
import { loadLinks } from "./linkCache";
import { isValidSlug, slugFromPath } from "./slug";

/** Headers on every redirect: never cached, never indexed. */
const REDIRECT_HEADERS = {
  "cache-control": "private, no-store",
  "x-robots-tag": "noindex",
} as const;

/**
 * A 302 to `location`. Deliberately not 301: browsers cache 301s forever, so
 * repeat visits would skip the Worker (uncounted) and a link could never be
 * re-pointed.
 *
 * @param location - Absolute URL.
 * @returns The redirect response.
 */
export function redirectTo(location: string): Response {
  return new Response(null, {
    status: 302,
    headers: { location, ...REDIRECT_HEADERS },
  });
}

/**
 * Carries the visitor's query string (UTM tags, etc.) onto the destination.
 * Parameters the destination already sets win.
 *
 * @param destination - The link's target.
 * @param incoming - Query of the short-link request.
 * @returns The destination with the extra parameters appended.
 */
export function mergeQuery(
  destination: string,
  incoming: URLSearchParams
): string {
  const url = new URL(destination);
  for (const [key, value] of incoming) {
    if (!url.searchParams.has(key)) {
      url.searchParams.append(key, value);
    }
  }
  return url.toString();
}

/** Context the redirect needs beyond the request. */
export interface RedirectContext {
  /** Worker bindings. */
  readonly env: Env;
  /** Defers click logging past the response. */
  readonly waitUntil: (promise: Promise<unknown>) => void;
  /** `caches.default`, or undefined in tests. */
  readonly cache: Cache | undefined;
  /** Clock, ms since epoch. */
  readonly now: number;
}

/**
 * Handles a request on the short-link host: `/` and unknown slugs go to
 * furrycolombia.com, known slugs to their destination. GET clicks on
 * well-formed slugs (hits and typo misses) are logged after the response is
 * sent; malformed paths are not logged at all. Logging failures never affect
 * the visitor.
 *
 * @param request - Incoming request.
 * @param context - Bindings, waitUntil, cache and clock.
 * @returns A 302 (or a tiny 204/404 for favicon/robots).
 */
export async function handleRedirect(
  request: Request,
  context: RedirectContext
): Promise<Response> {
  const url = new URL(request.url);
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response(null, { status: 405, headers: { allow: "GET, HEAD" } });
  }
  if (url.pathname === "/favicon.ico") {
    return new Response(null, { status: 204 });
  }
  const slug = slugFromPath(url.pathname);
  if (slug === "") {
    return redirectTo(FALLBACK_URL);
  }

  // Paths that cannot be a slug (`.env`, `config.json`, `.git/HEAD`) are
  // vulnerability scanners, not typos: redirect them without a D1 write, so
  // they neither pollute the stats nor spend the daily write allowance.
  if (!isValidSlug(slug)) {
    return redirectTo(FALLBACK_URL);
  }

  const snapshot = await loadLinks(context.env.DB, context.cache, context.now);
  const target = snapshot?.links[slug];
  const location =
    target?.active === true
      ? mergeQuery(target.destination, url.searchParams)
      : FALLBACK_URL;

  // With no snapshot at all D1 is down and nothing was cached: logging would
  // fail too, and "miss" would be a lie, so skip it.
  if (request.method === "GET" && snapshot !== null) {
    context.waitUntil(
      buildClick(request, {
        slug,
        miss: target === undefined,
        now: context.now,
        hashKey: context.env.VISITOR_HASH_KEY,
      })
        .then((row) => recordClick(context.env.DB, row))
        .catch((error: unknown) => {
          console.error("click logging failed", error);
        })
    );
  }
  return redirectTo(location);
}
