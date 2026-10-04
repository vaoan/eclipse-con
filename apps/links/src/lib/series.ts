import type { SeriesPoint } from "@/components/SeriesPlot";
import { formatDay } from "@/lib/format";
import { bogotaDate, eachDay } from "@/lib/range";
import type { Counts, DayPoint, HourPoint } from "@/types";

/**
 * The count a chart plots: human clicks, plus bot hits and link-preview
 * fetches when the "include bots" toggle is on.
 *
 * @param counts - A stats row.
 * @param includeBots - The toggle.
 * @returns The number to plot.
 */
export function shownCount(counts: Counts, includeBots: boolean): number {
  return counts.clicks + (includeBots ? counts.bots + counts.previews : 0);
}

/**
 * One point per day in the range, zero-filled.
 *
 * @param series - `stats.series`.
 * @param from - Range start.
 * @param to - Range end.
 * @param includeBots - The toggle.
 * @param language - UI language for labels.
 * @returns Chart points.
 */
export function dailyPoints(
  series: readonly DayPoint[],
  from: string,
  to: string,
  includeBots: boolean,
  language: string
): SeriesPoint[] {
  const byDay = new Map(series.map((point) => [point.date, point]));
  return eachDay(from, to).map((day) => {
    const point = byDay.get(day);
    return {
      key: day,
      label: formatDay(day, language),
      clicks: point ? shownCount(point, includeBots) : 0,
      uniques: point?.uniques ?? 0,
    };
  });
}

/**
 * The last 24 hours, one point per hour (Bogotá), zero-filled. Hourly
 * "uniques" are visitors whose first click of the day fell in that hour.
 *
 * @param hours - `stats.hours`.
 * @param now - Clock, ms.
 * @param includeBots - The toggle.
 * @returns 24 chart points, oldest first.
 */
export function hourlyPoints(
  hours: readonly HourPoint[],
  now: number,
  includeBots: boolean
): SeriesPoint[] {
  const byHour = new Map(
    hours.map((point) => [`${point.date} ${point.hour}`, point])
  );
  const points: SeriesPoint[] = [];
  for (let back = 23; back >= 0; back -= 1) {
    const instant = now - back * 3_600_000;
    const day = bogotaDate(instant);
    const hour = String(
      new Date(instant - 5 * 3_600_000).getUTCHours()
    ).padStart(2, "0");
    const point = byHour.get(`${day} ${hour}`);
    points.push({
      key: `${day} ${hour}`,
      label: `${hour}:00`,
      clicks: point ? shownCount(point, includeBots) : 0,
      uniques: point?.uniques ?? 0,
    });
  }
  return points;
}

/**
 * Totals across a range for the stat tiles.
 *
 * @param series - `stats.series`.
 * @returns Summed counts.
 */
export function totals(series: readonly DayPoint[]): Counts {
  return series.reduce<Counts>(
    (sum, point) => ({
      clicks: sum.clicks + point.clicks,
      uniques: sum.uniques + point.uniques,
      bots: sum.bots + point.bots,
      previews: sum.previews + point.previews,
    }),
    { clicks: 0, uniques: 0, bots: 0, previews: 0 }
  );
}
