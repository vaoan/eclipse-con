/** Date-range presets offered above the charts. */
export const RANGE_PRESETS = ["1d", "7d", "30d", "90d", "all"] as const;

/** A preset, or a custom from/to. */
export type RangePreset = (typeof RANGE_PRESETS)[number] | "custom";

/** First date "all time" covers (before fco.bz existed). */
export const ALL_TIME_FROM = "2026-10-01";

const DAY_MS = 86_400_000;
const BOGOTA_OFFSET_MS = -5 * 60 * 60 * 1000;

/**
 * Bogotá calendar date `offsetDays` from `now`.
 *
 * @param now - ms since epoch.
 * @param offsetDays - Days to add.
 * @returns `YYYY-MM-DD`.
 */
export function bogotaDate(now: number, offsetDays = 0): string {
  return new Date(now + BOGOTA_OFFSET_MS + offsetDays * DAY_MS)
    .toISOString()
    .slice(0, 10);
}

/**
 * The inclusive from/to dates a preset covers. `1d` spans yesterday and
 * today so the hourly chart can show a rolling 24 hours.
 *
 * @param preset - A preset other than `custom`.
 * @param now - ms since epoch.
 * @returns From and to dates.
 */
export function presetRange(
  preset: Exclude<RangePreset, "custom">,
  now: number
): { from: string; to: string } {
  const to = bogotaDate(now);
  switch (preset) {
    case "1d": {
      return { from: bogotaDate(now, -1), to };
    }
    case "7d": {
      return { from: bogotaDate(now, -6), to };
    }
    case "30d": {
      return { from: bogotaDate(now, -29), to };
    }
    case "90d": {
      return { from: bogotaDate(now, -89), to };
    }
    case "all": {
      return { from: ALL_TIME_FROM, to };
    }
  }
}

/**
 * Monday-first weekday index (0 = Monday) of a `YYYY-MM-DD` date.
 *
 * @param day - Calendar date.
 * @returns 0–6.
 */
export function mondayIndex(day: string): number {
  return (new Date(`${day}T00:00:00Z`).getUTCDay() + 6) % 7;
}

/**
 * Every date from `from` to `to` inclusive, so days without clicks still
 * appear as zero instead of being skipped by the line.
 *
 * @param from - `YYYY-MM-DD`.
 * @param to - `YYYY-MM-DD`.
 * @returns The dates in order.
 */
export function eachDay(from: string, to: string): string[] {
  const days: string[] = [];
  const end = Date.parse(`${to}T00:00:00Z`);
  for (
    let cursor = Date.parse(`${from}T00:00:00Z`);
    cursor <= end && days.length < 3660;
    cursor += DAY_MS
  ) {
    days.push(new Date(cursor).toISOString().slice(0, 10));
  }
  return days;
}
