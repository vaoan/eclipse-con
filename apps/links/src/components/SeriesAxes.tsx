import { useTranslation } from "@/i18n";
import { formatCount } from "@/lib/format";

interface SeriesAxesProps {
  /** Y tick values. */
  readonly ticks: readonly number[];
  /** X labels, one per position. */
  readonly labels: readonly { key: string; label: string }[];
  readonly left: number;
  readonly right: number;
  /** Baseline of the x labels. */
  readonly labelY: number;
  readonly x: (index: number) => number;
  readonly y: (value: number) => number;
}

/** At most this many x labels, so they never collide. */
const MAX_X_LABELS = 8;

/** Recessive hairline gridlines with y ticks, plus thinned x labels. */
export function SeriesAxes({
  ticks,
  labels,
  left,
  right,
  labelY,
  x,
  y,
}: Readonly<SeriesAxesProps>) {
  const { i18n } = useTranslation();
  const labelEvery = Math.max(1, Math.ceil(labels.length / MAX_X_LABELS));
  return (
    <g>
      {ticks.map((tick) => (
        <g key={tick}>
          <line
            className="grid"
            x1={left}
            x2={right}
            y1={y(tick)}
            y2={y(tick)}
          />
          <text
            className="axis-label"
            x={left - 8}
            y={y(tick)}
            dy="0.32em"
            textAnchor="end"
          >
            {formatCount(tick, i18n.language)}
          </text>
        </g>
      ))}
      {labels.map((point, index) =>
        index % labelEvery === 0 ? (
          <text
            key={point.key}
            className="axis-label"
            x={x(index)}
            y={labelY}
            textAnchor="middle"
          >
            {point.label}
          </text>
        ) : null
      )}
    </g>
  );
}
