import { useMemo } from "react";
import { Flower, FLOWER_VARIANTS } from "@/components/Flower";
import { FALLING_FLOWER_COUNT, FLOWER_COLORS } from "@/carnaval";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

const FLOWER_KEYFRAMES = [
  "float-flower-1",
  "float-flower-2",
  "float-flower-3",
] as const;

/** Deterministic pseudo-random value for less-uniform particle motion. */
function seededValue(index: number, offset: number): number {
  const seed = Math.sin((index + 1) * 12.9898 + offset * 78.233) * 43758.5453;
  return seed - Math.floor(seed);
}

/**
 * A fixed overlay of small Colombian carnaval flowers drifting down the screen.
 * Ported from moonfest's sakura petals. Renders nothing under reduced motion.
 */
export function FallingFlowers() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const count = prefersReducedMotion ? 0 : FALLING_FLOWER_COUNT;

  const flowers = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => {
        const size = 18 + seededValue(index, 3) * 18;
        return {
          id: index,
          left: `${seededValue(index, 0) * 100}%`,
          delay: `-${(seededValue(index, 1) * 22).toFixed(2)}s`,
          duration: `${11 + seededValue(index, 2) * 11}s`,
          size,
          opacity: 0.5 + seededValue(index, 4) * 0.4,
          keyframe: FLOWER_KEYFRAMES[index % 3] ?? "float-flower-1",
          color:
            FLOWER_COLORS[index % FLOWER_COLORS.length] ??
            "var(--color-yellow)",
          variant: index % FLOWER_VARIANTS,
          topOffset: -(10 + seededValue(index, 6) * 30),
        };
      }),
    [count]
  );

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
