import { useMemo } from "react";

import { SAKURA_PARTICLE_COUNT } from "@/features/convention/domain/constants";
import { usePrefersReducedMotion } from "@/shared/application/hooks/usePrefersReducedMotion";

const PETAL_KEYFRAMES = [
  "float-petal-1",
  "float-petal-2",
  "float-petal-3",
] as const;

function seededValue(index: number, offset: number) {
  // Deterministic pseudo-random value for less-uniform motion
  const seed = Math.sin((index + 1) * 12.9898 + offset * 78.233) * 43758.5453;
  return seed - Math.floor(seed);
}

/** Renders a fixed overlay of animated sakura petal particles. Returns `null` when reduced motion is preferred. */
export function SakuraParticles() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const particleCount = useMemo(() => {
    if (prefersReducedMotion) {
      return 0;
    }
    return SAKURA_PARTICLE_COUNT;
  }, [prefersReducedMotion]);

  const petals = useMemo(
    () =>
      Array.from({ length: particleCount }, (_, index) => {
        const size = 6 + seededValue(index, 3) * 8;
        return {
          id: index,
          left: `${seededValue(index, 0) * 100}%`,
          delay: `${seededValue(index, 1) * 16}s`,
          duration: `${10 + seededValue(index, 2) * 10}s`,
          width: `${size}px`,
          height: `${size * 0.5}px`,
          opacity: 0.08 + seededValue(index, 4) * 0.25,
          keyframe: PETAL_KEYFRAMES[index % 3],
          initialRotation: Math.round(seededValue(index, 5) * 360),
          topOffset: -(10 + seededValue(index, 6) * 40),
          blur: 0.2 + seededValue(index, 7) * 0.8,
        };
      }),
    [particleCount]
  );

  if (!particleCount) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[5] overflow-hidden"
      aria-hidden="true"
    >
      {petals.map((petal) => (
        <span
          key={petal.id}
          className="absolute sakura-petal"
          style={{
            left: petal.left,
            top: `${petal.topOffset}px`,
            width: petal.width,
            height: petal.height,
            borderRadius: "50% 50% 50% 0",
            opacity: petal.opacity,
            backgroundColor: "var(--color-sakura)",
            filter: `blur(${petal.blur}px)`,
            transform: `rotate(${String(petal.initialRotation)}deg)`,
            animation: `${petal.keyframe} ${petal.duration} ${petal.delay} linear infinite`,
          }}
        />
      ))}
    </div>
  );
}
