import type { BarItem } from "@/components/BarList";
import { countryName, languageName } from "@/lib/format";
import { shownCount } from "@/lib/series";
import type { BreakdownRow } from "@/types";

/** Breakdown cards, in display order. */
export const BREAKDOWNS = [
  "country",
  "region",
  "city",
  "device",
  "os",
  "browser",
  "lang",
  "as_org",
  "referrer_host",
  "preview_app",
  "utm_source",
  "utm_medium",
  "utm_campaign",
] as const;

/** A breakdown card id. */
export type BreakdownId = (typeof BREAKDOWNS)[number];

/** Devices with a translated name under `device.*`. */
const KNOWN_DEVICES = new Set([
  "mobile",
  "tablet",
  "desktop",
  "smarttv",
  "console",
  "wearable",
  "embedded",
  "bot",
]);

/**
 * Human label for a breakdown value.
 *
 * @param id - Which breakdown.
 * @param value - Raw value (`CO`, `CO|Antioquia`, `es-CO`, `mobile`…).
 * @param t - Translator.
 * @param language - UI language.
 * @returns Display text.
 */
export function labelFor(
  id: BreakdownId,
  value: string,
  t: (key: string) => string,
  language: string
): string {
  if (id === "region" || id === "city") {
    const [country = "", place = ""] = value.split("|");
    if (place === "") {
      return t("breakdown.unknown");
    }
    return country ? `${place} · ${countryName(country, language)}` : place;
  }
  if (value === "") {
    if (id === "referrer_host") {
      return t("breakdown.direct");
    }
    return id.startsWith("utm_")
      ? t("breakdown.untagged")
      : t("breakdown.unknown");
  }
  switch (id) {
    case "country": {
      return countryName(value, language);
    }
    case "lang": {
      return languageName(value, language);
    }
    case "device": {
      return KNOWN_DEVICES.has(value) ? t(`device.${value}`) : value;
    }
    default: {
      return value;
    }
  }
}

/**
 * Turns API rows into bars: label, the count shown (previews for "shared
 * on", otherwise clicks ± bots), sorted, zero rows dropped.
 *
 * @param id - Which breakdown.
 * @param rows - `stats.dims[id]`.
 * @param includeBots - The toggle.
 * @param t - Translator.
 * @param language - UI language.
 * @returns Bars for {@link BarList}.
 */
export function toBarItems(
  id: BreakdownId,
  rows: readonly BreakdownRow[],
  includeBots: boolean,
  t: (key: string) => string,
  language: string
): BarItem[] {
  return rows
    .filter((row) => !(id === "preview_app" && row.value === ""))
    .map((row) => ({
      key: row.value,
      label: labelFor(id, row.value, t, language),
      count: id === "preview_app" ? row.previews : shownCount(row, includeBots),
      uniques: row.uniques,
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count);
}

/**
 * Clicks per country code for the map.
 *
 * @param rows - `stats.dims.country`.
 * @param includeBots - The toggle.
 * @returns Counts keyed by ISO alpha-2 code.
 */
export function countryCounts(
  rows: readonly BreakdownRow[],
  includeBots: boolean
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const row of rows) {
    if (row.value !== "") {
      counts[row.value] = shownCount(row, includeBots);
    }
  }
  return counts;
}
