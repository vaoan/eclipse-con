import { useMemo } from "react";

import { SAKURA_PARTICLE_COUNT } from "@/features/convention/domain/constants";

const PETAL_KEYFRAMES = [
  "float-petal-1",
  "float-petal-2",
  "float-petal-3",
] as const;

function seededValue(index: number, offset: number) {
  // Deterministic-looking spread based on index for visual variety
  return ((index * 7 + offset * 13) % 100) / 100;
}

export function SakuraParticles() {
  const petals = useMemo(
    () =>
      Array.from({ length: SAKURA_PARTICLE_COUNT }, (_, index) => {
        const size = 6 + seededValue(index, 3) * 8;
        return {
          id: index,
          left: `${seededValue(index, 0) * 100}%`,
          delay: `${seededValue(index, 1) * 12}s`,
          duration: `${8 + seededValue(index, 2) * 8}s`,
          width: `${size}px`,
          height: `${size * 0.5}px`,
          opacity: 0.3 + seededValue(index, 4) * 0.5,
          keyframe: PETAL_KEYFRAMES[index % 3],
          initialRotation: Math.round(seededValue(index, 5) * 360),
        };
      }),
    []
  );

  return (
    <div
      className="pointer-events-none fixed inset-0 z-10 overflow-hidden"
      aria-hidden="true"
    >
      {petals.map((petal) => (
        <span
          key={petal.id}
          className="absolute"
          style={{
            left: petal.left,
            top: "-10px",
            width: petal.width,
            height: petal.height,
            borderRadius: "50% 50% 50% 0",
            opacity: petal.opacity,
            backgroundColor: "var(--color-sakura)",
            transform: `rotate(${String(petal.initialRotation)}deg)`,
            animation: `${petal.keyframe} ${petal.duration} ${petal.delay} linear infinite`,
          }}
        />
      ))}
    </div>
  );
}
