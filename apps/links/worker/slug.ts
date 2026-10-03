/** Allowed slug shape: lowercase letters, digits and hyphens, 1–32 chars. */
export const SLUG_PATTERN = /^[a-z0-9-]{1,32}$/;

/**
 * Words vulnerability scanners probe on every new domain. They can never be
 * slugs: the Cloudflare firewall rule (`pnpm links:waf`, which reads this list)
 * blocks them before the Worker runs, the Sheet sync rejects them, and the
 * redirect does not log them.
 */
export const RESERVED_SLUGS: readonly string[] = [
  "actuator",
  "admin",
  "api",
  "app",
  "application",
  "backend",
  "backup",
  "cgi-bin",
  "config",
  "debug",
  "env",
  "functions",
  "js",
  "phpmyadmin",
  "server",
  "vendor",
  "wp-admin",
  "wp-content",
  "wp-includes",
  "wp-login",
];

/** Longest slug kept when logging a miss, so junk paths cannot bloat rows. */
const MAX_MISS_LENGTH = 64;

/**
 * Turns a request path into the slug it names: the first path segment,
 * lower-cased and URI-decoded. `/S27/` → `s27`; `/` → `""`.
 *
 * @param pathname - `URL.pathname` of the incoming request.
 * @returns The candidate slug (may be invalid; check with {@link isValidSlug}).
 */
export function slugFromPath(pathname: string): string {
  const segment = pathname.split("/").find((part) => part !== "") ?? "";
  let decoded = segment;
  try {
    decoded = decodeURIComponent(segment);
  } catch {
    // Malformed %-escape: keep the raw segment; it will fail validation.
  }
  return decoded.trim().toLowerCase().slice(0, MAX_MISS_LENGTH);
}

/**
 * Whether a string is a usable slug: well-formed and not reserved.
 *
 * @param slug - Candidate slug.
 * @returns True when it matches {@link SLUG_PATTERN} and is not in
 *   {@link RESERVED_SLUGS}.
 */
export function isValidSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug) && !RESERVED_SLUGS.includes(slug);
}

/**
 * Whether a string is an absolute `https://` URL with a host.
 *
 * @param value - Candidate destination.
 * @returns True for a parseable https URL.
 */
export function isHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname !== "";
  } catch {
    return false;
  }
}
