/**
 * A count, auto-compacted past 10,000 (12.9 K, 1.2 M).
 *
 * @param value - The number.
 * @param language - UI language.
 * @returns Formatted text.
 */
export function formatCount(value: number, language: string): string {
  return new Intl.NumberFormat(language, {
    notation: value >= 10_000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Date and time in Bogotá, short.
 *
 * @param epochMs - ms since epoch.
 * @param language - UI language.
 * @returns e.g. "3 oct, 15:30".
 */
export function formatDateTime(epochMs: number, language: string): string {
  return new Intl.DateTimeFormat(language, {
    timeZone: "America/Bogota",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(epochMs);
}

/**
 * A calendar date, short.
 *
 * @param day - `YYYY-MM-DD`.
 * @param language - UI language.
 * @returns e.g. "3 oct".
 */
export function formatDay(day: string, language: string): string {
  return new Intl.DateTimeFormat(language, {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
  }).format(Date.parse(`${day}T00:00:00Z`));
}

/**
 * A country's name in the UI language from its ISO alpha-2 code.
 *
 * @param code - e.g. `CO`.
 * @param language - UI language.
 * @returns e.g. "Colombia", or the code when unknown.
 */
export function countryName(code: string, language: string): string {
  try {
    return (
      new Intl.DisplayNames([language], { type: "region" }).of(code) ?? code
    );
  } catch {
    return code;
  }
}

/**
 * A language tag's display name (`es-CO` → "español (Colombia)").
 *
 * @param tag - BCP 47 tag.
 * @param language - UI language.
 * @returns The name, or the tag when unknown.
 */
export function languageName(tag: string, language: string): string {
  try {
    return (
      new Intl.DisplayNames([language], { type: "language" }).of(tag) ?? tag
    );
  } catch {
    return tag;
  }
}

/**
 * The short URL for a slug.
 *
 * @param slug - Link slug.
 * @returns `https://fco.bz/<slug>`.
 */
export function shortUrl(slug: string): string {
  return `https://fco.bz/${slug}`;
}
