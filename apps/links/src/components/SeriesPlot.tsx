import { SeriesAxes } from "@/components/SeriesAxes";
import { SeriesTooltip } from "@/components/SeriesTooltip";
import { linear, niceTicks } from "@/lib/scale";
import { useElementWidth } from "@/lib/useElementWidth";
import { useSeriesHover } from "@/lib/useSeriesHover";

/** One x position: its axis label and both series' values. */
export interface SeriesPoint {
  readonly key: string;
  readonly label: string;
  readonly clicks: number;
  readonly uniques: number;
}

interface SeriesPlotProps {
  readonly title: string;
  readonly points: readonly SeriesPoint[];
}

const HEIGHT = 240;
const MARGIN = { top: 12, right: 16, bottom: 28, left: 44 } as const;

/**
 * SVG plot of clicks (2px line + 10% wash) and unique visitors (2px line) on
 * one axis, with a snapping crosshair, a tooltip listing both series, and
 * ← → keyboard navigation giving the same readout as hover.
 */
export function SeriesPlot({ title, points }: Readonly<SeriesPlotProps>) {
  const [frameRef, width] = useElementWidth<HTMLDivElement>(720);
  const hover = useSeriesHover(points.length);

  const right = width - MARGIN.right;
  const bottom = HEIGHT - MARGIN.bottom;
  const max = Math.max(
    1,
    ...points.map((point) => Math.max(point.clicks, point.uniques))
  );
  const ticks = niceTicks(max);
  const x = linear([0, Math.max(1, points.length - 1)], [MARGIN.left, right]);
  const y = linear([0, ticks.at(-1) ?? max], [bottom, MARGIN.top]);
  const line = (pick: (point: SeriesPoint) => number) =>
    points
      .map(
        (point, index) =>
          `${index === 0 ? "M" : "L"}${x(index).toFixed(1)},${y(pick(point)).toFixed(1)}`
      )
      .join("");
  const clicksLine = line((point) => point.clicks);
  const activeX = x(hover.active ?? 0);
  const activePoint = hover.active === null ? undefined : points[hover.active];

  return (
    <div className="chart-frame" ref={frameRef}>
      <svg
        width={width}
        height={HEIGHT}
        role="img"
        aria-label={title}
        tabIndex={0}
        onKeyDown={hover.onKeyDown}
        onBlur={hover.clear}
      >
        <SeriesAxes
          ticks={ticks}
          labels={points}
          left={MARGIN.left}
          right={right}
          labelY={HEIGHT - 8}
          x={x}
          y={y}
        />
        <path
          className="area series-1"
          d={`${clicksLine}L${x(points.length - 1)},${bottom}L${x(0)},${bottom}Z`}
        />
        <path className="line series-2" d={line((point) => point.uniques)} />
        <path className="line series-1" d={clicksLine} />
        {activePoint ? (
          <g>
            <line
              className="crosshair"
              x1={activeX}
              x2={activeX}
              y1={MARGIN.top}
              y2={bottom}
            />
            <circle
              className="dot series-2"
              cx={activeX}
              cy={y(activePoint.uniques)}
              r={4}
            />
            <circle
              className="dot series-1"
              cx={activeX}
              cy={y(activePoint.clicks)}
              r={4}
            />
          </g>
        ) : null}
        <rect
          className="hit-area"
          x={MARGIN.left}
          y={MARGIN.top}
          width={right - MARGIN.left}
          height={bottom - MARGIN.top}
          onPointerMove={hover.onPointerMove}
          onPointerLeave={hover.clear}
        />
      </svg>
      {activePoint ? (
        <SeriesTooltip
          point={activePoint}
          left={Math.min(activeX + 12, width - 190)}
          top={MARGIN.top}
        />
      ) : null}
    </div>
  );
}
