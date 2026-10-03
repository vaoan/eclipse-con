import type { SeriesPoint } from "@/components/SeriesPlot";
import { useTranslation } from "@/i18n";
import { formatCount } from "@/lib/format";

interface SeriesTooltipProps {
  readonly point: SeriesPoint;
  readonly left: number;
  readonly top: number;
}

/**
 * Crosshair readout: the x label, then each series — value first (strong),
 * name second, keyed by a short line in the series color.
 */
export function SeriesTooltip({
  point,
  left,
  top,
}: Readonly<SeriesTooltipProps>) {
  const { t, i18n } = useTranslation();
  return (
    <div className="tooltip" role="status" style={{ left, top }}>
      <div className="tooltip-title">{point.label}</div>
      <div className="tooltip-row">
        <span className="key key-line series-1" />
        <strong>{formatCount(point.clicks, i18n.language)}</strong>
        <span>{t("chart.clicks")}</span>
      </div>
      <div className="tooltip-row">
        <span className="key key-line series-2" />
        <strong>{formatCount(point.uniques, i18n.language)}</strong>
        <span>{t("chart.uniques")}</span>
      </div>
    </div>
  );
}
