/** Allowed slug shape: lowercase letters, digits and hyphens, 1–32 chars. */
export const SLUG_PATTERN = /^[a-z0-9-]{1,32}$/;

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
 * Whether a string is a well-formed slug.
 *
 * @param slug - Candidate slug.
 * @returns True when it matches {@link SLUG_PATTERN}.
 */
export function isValidSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug);
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
