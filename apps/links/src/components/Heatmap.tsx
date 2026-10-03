import type { CSSProperties } from "react";
import { useTranslation } from "@/i18n";
import { mondayIndex } from "@/lib/range";
import { tid } from "@/lib/tid";
import type { HourPoint } from "@/types";

interface HeatmapProps {
  readonly hours: readonly HourPoint[];
  readonly includeBots: boolean;
}

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);
const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6] as const;

/**
 * Clicks by weekday × hour (Bogotá), summed over the range. Built as a real
 * table — each cell carries its count as text for screen readers and a
 * tooltip — shaded with one hue whose lightest step recedes into the surface.
 */
export function Heatmap({ hours, includeBots }: Readonly<HeatmapProps>) {
  const { t } = useTranslation();
  const grid = WEEKDAYS.map(() => HOURS.map(() => 0));
  for (const point of hours) {
    const count =
      point.clicks + (includeBots ? point.bots + point.previews : 0);
    const row = grid[mondayIndex(point.date)];
    const hour = Number(point.hour);
    if (row && hour >= 0 && hour < 24) {
      row[hour] = (row[hour] ?? 0) + count;
    }
  }
  const max = Math.max(1, ...grid.flat());

  return (
    <section
      className="card card-wide"
      data-content-section="stats"
      data-testid={tid("heatmap")}
    >
      <h3 className="card-title">{t("heatmap.title")}</h3>
      <div className="table-scroll">
        <table className="heatmap">
          <caption className="visually-hidden">{t("heatmap.title")}</caption>
          <thead>
            <tr>
              <th scope="col" className="visually-hidden">
                {t("heatmap.weekday")}
              </th>
              {HOURS.map((hour) => (
                <th key={hour} scope="col" className="axis-label">
                  {hour % 3 === 0 ? String(hour).padStart(2, "0") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {WEEKDAYS.map((weekday) => {
              const dayLabel = t(`heatmap.weekdays.${String(weekday)}`);
              return (
                <tr key={weekday}>
                  <th scope="row" className="axis-label">
                    {dayLabel}
                  </th>
                  {HOURS.map((hour) => {
                    const count = grid[weekday]?.[hour] ?? 0;
                    const label = t("heatmap.cell", {
                      day: dayLabel,
                      hour: String(hour).padStart(2, "0"),
                      count,
                    });
                    return (
                      <td
                        key={hour}
                        className="heat-cell"
                        title={label}
                        style={
                          {
                            "--heat": `${String(Math.round((count / max) * 100))}%`,
                          } as CSSProperties
                        }
                      >
                        <span className="visually-hidden">{label}</span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
