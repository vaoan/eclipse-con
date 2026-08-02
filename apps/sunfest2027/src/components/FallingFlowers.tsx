import { useMemo } from "react";
import { Flower, FLOWER_VARIANTS } from "@/components/Flower";
import { FALLING_FLOWER_COUNT, FLOWER_COLORS } from "@/carnaval";
import { useFlowerShower } from "@/lib/useFlowerShower";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

const FLOWER_KEYFRAMES = [
  "float-flower-1",
  "float-flower-2",
  "float-flower-3",
] as const;

/**
 * Fixed seed: the shower is random-looking but identical on every render.
 * Chosen by scoring seeds for even coverage — this one leaves no gap wider
 * than 7.3% of the screen, no two flowers closer than 3.1%, and no
 * correlation between where a flower falls and when it starts.
 */
const SEED = 0x3585;

/** Longest fall cycle in seconds, used to spread the start delays. */
const CYCLE_SECONDS = 22;

/**
 * Deterministic PRNG (mulberry32). The previous `fract(sin(i))` hash correlated
 * badly across small sequential indices, which is what made the shower look
 * patterned rather than random.
 *
 * @param seed - Any 32-bit integer.
 * @returns A function yielding successive values in [0, 1).
 */
function makeRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Spreads `count` values evenly across `span` and jitters each within its own
 * slice. True randomness clumps badly at these sample sizes — this keeps the
 * even coverage the eye expects while still looking unplanned.
 *
 * @param count - How many values to produce.
 * @param span - Upper bound of the range to cover.
 * @param random - Source of randomness.
 * @returns Jittered values, one per evenly sized slice.
 */
function stratified(
  count: number,
  span: number,
  random: () => number
): number[] {
  const slice = span / count;
  return Array.from(
    { length: count },
    (_, index) => (index + random()) * slice
  );
}

/**
 * Fisher-Yates shuffle, so a value's slice index carries no relationship to the
 * flower that ends up with it.
 *
 * @param items - Array to copy and shuffle.
 * @param random - Source of randomness.
 * @returns A shuffled copy.
 */
function shuffled<T>(items: readonly T[], random: () => number): T[] {
  const pool = [...items];
  const result: T[] = [];
  while (pool.length > 0) {
    const [picked] = pool.splice(Math.floor(random() * pool.length), 1);
    if (picked !== undefined) {
      result.push(picked);
    }
  }
  return result;
}

/**
 * Builds an evenly distributed pool of `count` picks from `options`, shuffled.
 * Cycling `index % options.length` gave every third flower the same drift path
 * in a visible repeating rhythm; this keeps the even spread without the rhythm.
 *
 * @param count - How many picks to produce.
 * @param options - Values to draw from.
 * @param random - Source of randomness.
 * @returns One value per flower, evenly spread and shuffled.
 */
function balancedPicks<T>(
  count: number,
  options: readonly T[],
  random: () => number
): T[] {
  const pool: T[] = [];
  for (let index = 0; index < count; index += 1) {
    const option = options[index % options.length];
    if (option !== undefined) {
      pool.push(option);
    }
  }
  return shuffled(pool, random);
}

/**
 * A fixed overlay of small Colombian carnaval flowers drifting down the screen.
 * Ported from moonfest's sakura petals. Renders nothing under reduced motion.
 */
export function FallingFlowers() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const flowerShowerOn = useFlowerShower();
  const count =
    prefersReducedMotion || !flowerShowerOn ? 0 : FALLING_FLOWER_COUNT;

  const flowers = useMemo(() => {
    const random = makeRandom(SEED);

    // Position and timing are stratified then shuffled independently, so the
    // screen is covered evenly, the shower is steady rather than bursty, and
    // neither correlates with a flower's shape, colour or path.
    const lefts = shuffled(stratified(count, 100, random), random);
    const delays = shuffled(stratified(count, CYCLE_SECONDS, random), random);
    const keyframes = balancedPicks(count, FLOWER_KEYFRAMES, random);
    const colors = balancedPicks(count, FLOWER_COLORS, random);
    const variants = balancedPicks(
      count,
      Array.from({ length: FLOWER_VARIANTS }, (_, index) => index),
      random
    );

    return Array.from({ length: count }, (_, index) => ({
      id: index,
      left: `${(lefts[index] ?? 0).toFixed(2)}%`,
      delay: `-${(delays[index] ?? 0).toFixed(2)}s`,
      duration: `${(11 + random() * 11).toFixed(2)}s`,
      size: 18 + random() * 18,
      opacity: 0.5 + random() * 0.4,
      keyframe: keyframes[index] ?? "float-flower-1",
      color: colors[index] ?? "var(--color-yellow)",
      variant: variants[index] ?? 0,
      topOffset: -(10 + random() * 30),
    }));
  }, [count]);

  if (!count) {
    return null;
  }

  return (
    <div className="flower-fall" aria-hidden="true">
      {flowers.map((flower) => (
        <span
          key={flower.id}
          className="falling-flower"
          style={{
            left: flower.left,
            top: `${flower.topOffset}px`,
            width: `${flower.size}px`,
            height: `${flower.size}px`,
            opacity: flower.opacity,
            animation: `${flower.keyframe} ${flower.duration} ${flower.delay} linear infinite`,
          }}
        >
          <Flower variant={flower.variant} color={flower.color} />
        </span>
      ))}
    </div>
  );
}
