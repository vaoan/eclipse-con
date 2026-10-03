import { lazy, Suspense } from "react";
import { BarList } from "@/components/BarList";
import { ExportButton } from "@/components/ExportButton";
import { Heatmap } from "@/components/Heatmap";
import { StatTiles } from "@/components/StatTiles";
import { TimeSeriesChart } from "@/components/TimeSeriesChart";
import { useTranslation } from "@/i18n";
import { fetchStats, statsQuery } from "@/lib/api";
import { BREAKDOWNS, countryCounts, toBarItems } from "@/lib/breakdown";
import { cn } from "@/lib/cn";
import type { RangePreset } from "@/lib/range";
import { dailyPoints, hourlyPoints, totals } from "@/lib/series";
import { tid } from "@/lib/tid";
import { useApi } from "@/lib/useApi";
import type { Scope } from "@/types";

const WorldMap = lazy(() =>
  import("@/components/WorldMap").then((module) => ({
    default: module.WorldMap,
  }))
);

interface StatsViewProps {
  readonly scope: Scope;
  readonly from: string;
  readonly to: string;
  readonly preset: RangePreset;
  readonly includeBots: boolean;
  readonly now: number;
}

/**
 * Everything below the filter row for the current scope and range: stat
 * tiles, clicks over time, the weekday × hour heatmap, the map and every
 * breakdown. A refetch dims the previous render instead of blanking it.
 */
export function StatsView({
  scope,
  from,
  to,
  preset,
  includeBots,
  now,
}: Readonly<StatsViewProps>) {
  const { t, i18n } = useTranslation();
  const stats = useApi(
    (signal) => fetchStats(scope, from, to, signal),
    statsQuery(scope, from, to)
  );
  const data = stats.data;

  if (!data) {
    return (
      <p className="muted">
        {stats.error ? t("state.error") : t("state.loading")}
      </p>
    );
  }

  const hourly = preset === "1d";
  const points = hourly
    ? hourlyPoints(data.hours, now, includeBots)
    : dailyPoints(data.series, data.from, data.to, includeBots, i18n.language);
  const dims = (id: string) => data.dims[id] ?? [];

  return (
    <div
      className={cn("stats", stats.loading && "is-refreshing")}
      data-testid={tid("stats-view")}
    >
      <StatTiles totals={totals(data.series)} includeBots={includeBots} />
      <TimeSeriesChart
        title={hourly ? t("chart.titleHourly") : t("chart.title")}
        xLabel={hourly ? t("chart.hour") : t("chart.date")}
        points={points}
      />
      <Heatmap hours={data.hours} includeBots={includeBots} />
      <Suspense fallback={<p className="muted">{t("state.loading")}</p>}>
        <WorldMap counts={countryCounts(dims("country"), includeBots)} />
      </Suspense>
      <div className="grid">
        {BREAKDOWNS.map((id) => (
          <BarList
            key={id}
            id={id}
            title={t(`breakdown.${id}`)}
            hint={id === "preview_app" ? t("breakdown.previewHint") : undefined}
            items={toBarItems(id, dims(id), includeBots, t, i18n.language)}
          />
        ))}
      </div>
      <ExportButton from={data.from} to={data.to} />
    </div>
  );
}
