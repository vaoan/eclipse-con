import { useMemo } from "react";

import { SAKURA_PARTICLE_COUNT } from "@/features/convention/domain/constants";

function seededValue(index: number, offset: number) {
  // Deterministic-looking spread based on index for visual variety
  return ((index * 7 + offset * 13) % 100) / 100;
}

export function SakuraParticles() {
  const petals = useMemo(
    () =>
      Array.from({ length: SAKURA_PARTICLE_COUNT }, (_, index) => ({
        id: index,
        left: `${seededValue(index, 0) * 100}%`,
        delay: `${seededValue(index, 1) * 12}s`,
        duration: `${8 + seededValue(index, 2) * 8}s`,
        size: `${6 + seededValue(index, 3) * 8}px`,
        opacity: 0.3 + seededValue(index, 4) * 0.5,
      })),
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
          className="absolute rounded-full"
          style={{
            left: petal.left,
            top: "-10px",
            width: petal.size,
            height: petal.size,
            opacity: petal.opacity,
            backgroundColor: "var(--color-sakura)",
            animation: `float-petal ${petal.duration} ${petal.delay} linear infinite`,
          }}
        />
      ))}
    </div>
  );
}
