interface SparklineProps {
  /** Daily clicks, oldest first. */
  readonly values: readonly number[];
  /** Accessible summary, e.g. "42 clicks in 30 days". */
  readonly label: string;
}

const WIDTH = 96;
const HEIGHT = 24;

/** A 30-day trend line for the links table: one hue, no axes, last day dotted. */
export function Sparkline({ values, label }: Readonly<SparklineProps>) {
  const max = Math.max(1, ...values);
  const step = values.length > 1 ? WIDTH / (values.length - 1) : 0;
  const points = values.map(
    (value, index) =>
      [index * step, HEIGHT - 3 - (value / max) * (HEIGHT - 6)] as const
  );
  const last = points.at(-1);
  return (
    <svg
      className="sparkline"
      width={WIDTH}
      height={HEIGHT}
      role="img"
      aria-label={label}
    >
      <polyline
        className="line series-1"
        points={points
          .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
          .join(" ")}
      />
      {last ? (
        <circle className="dot series-1" cx={last[0]} cy={last[1]} r={2.5} />
      ) : null}
    </svg>
  );
}
