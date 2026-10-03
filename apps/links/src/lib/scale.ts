/**
 * Clean axis ticks from 0 to just above `max` (0 / 5 / 10, 0 / 200 / 400 …).
 *
 * @param max - Largest value plotted.
 * @param count - Rough number of intervals wanted.
 * @returns Tick values, ascending, starting at 0.
 */
export function niceTicks(max: number, count = 4): number[] {
  if (max <= 0) {
    return [0, 1];
  }
  const rough = max / count;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step =
    [1, 2, 5, 10]
      .map((factor) => factor * magnitude)
      .find((candidate) => candidate >= rough) ?? 10 * magnitude;
  const integerStep = Math.max(1, step);
  const ticks: number[] = [];
  for (let value = 0; value < max + integerStep; value += integerStep) {
    ticks.push(Math.round(value));
  }
  return ticks;
}

/**
 * Linear mapping from a domain to a pixel range.
 *
 * @param domain - [min, max] of the data.
 * @param range - [start, end] in pixels.
 * @returns The scale function.
 */
export function linear(
  domain: readonly [number, number],
  range: readonly [number, number]
): (value: number) => number {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0 || 1;
  return (value) => r0 + ((value - d0) / span) * (r1 - r0);
}
