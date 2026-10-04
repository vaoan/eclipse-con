import { useState } from "react";
import { ChartTable } from "@/components/ChartTable";
import { SeriesPlot, type SeriesPoint } from "@/components/SeriesPlot";
import { useTranslation } from "@/i18n";
import { formatCount } from "@/lib/format";
import { tid } from "@/lib/tid";

interface TimeSeriesChartProps {
  readonly title: string;
  readonly points: readonly SeriesPoint[];
  /** Column header for the x values in the table view. */
  readonly xLabel: string;
}

/**
 * The "clicks over time" card: legend, a chart/table toggle, and either the
 * plot (clicks + unique visitors on one axis) or its table twin.
 */
export function TimeSeriesChart({
  title,
  points,
  xLabel,
}: Readonly<TimeSeriesChartProps>) {
  const { t, i18n } = useTranslation();
  const [showTable, setShowTable] = useState(false);
  const isEmpty = points.every((point) => point.clicks === 0);

  return (
    <section
      className="card card-wide"
      data-content-section="stats"
      data-testid={tid("time-series")}
    >
      <header className="card-head">
        <h2 className="card-title">{title}</h2>
        <button
          type="button"
          className="ghost-button"
          onClick={() => {
            setShowTable((value) => !value);
          }}
          data-content-section="stats"
          data-content-id="time_series_table_toggle"
          data-content-interaction="toggle"
        >
          {showTable ? t("chart.showChart") : t("chart.showTable")}
        </button>
      </header>
      <ul className="legend">
        <li>
          <span className="key key-line series-1" />
          {t("chart.clicks")}
        </li>
        <li>
          <span className="key key-line series-2" />
          {t("chart.uniques")}
        </li>
      </ul>
      {isEmpty ? <p className="muted">{t("chart.empty")}</p> : null}
      {showTable ? (
        <ChartTable
          caption={title}
          columns={[xLabel, t("chart.clicks"), t("chart.uniques")]}
          rows={points.map((point) => [
            point.label,
            formatCount(point.clicks, i18n.language),
            formatCount(point.uniques, i18n.language),
          ])}
        />
      ) : (
        <SeriesPlot title={title} points={points} />
      )}
    </section>
  );
}
