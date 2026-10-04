/** Bogotá is UTC-5 all year (no daylight saving). */
const BOGOTA_OFFSET_MS = -5 * 60 * 60 * 1000;

/**
 * The Bogotá calendar date and hour of an instant. Stats are bucketed in
 * local time so "Tuesday 8 pm" means what the team expects.
 *
 * @param epochMs - Milliseconds since the epoch.
 * @returns `day` as `YYYY-MM-DD` and `hour` 0–23.
 */
export function bogotaDayHour(epochMs: number): { day: string; hour: number } {
  const local = new Date(epochMs + BOGOTA_OFFSET_MS);
  return { day: local.toISOString().slice(0, 10), hour: local.getUTCHours() };
}

/**
 * A Bogotá date `offsetDays` away from the given instant's date.
 *
 * @param epochMs - Reference instant.
 * @param offsetDays - Days to add (negative for the past).
 * @returns `YYYY-MM-DD`.
 */
export function bogotaDayOffset(epochMs: number, offsetDays: number): string {
  return bogotaDayHour(epochMs + offsetDays * 24 * 60 * 60 * 1000).day;
}

/**
 * ISO week label (`2026-W41`) of a Bogotá date, used to name weekly exports.
 *
 * @param day - `YYYY-MM-DD`.
 * @returns The ISO year and week.
 */
export function isoWeek(day: string): string {
  const date = new Date(`${day}T00:00:00Z`);
  const weekday = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - weekday);
  const yearStart = Date.UTC(date.getUTCFullYear(), 0, 1);
  const week = Math.ceil(((date.getTime() - yearStart) / 86_400_000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}
