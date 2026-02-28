import type { ReactNode } from "react";

import { useParallax } from "@/features/convention/application/hooks/useParallax";

interface ParallaxSectionProps {
  readonly speed: number;
  readonly children: ReactNode;
  readonly className?: string;
}

/** Wraps children in a `div` that applies a `translate3d` Y-offset driven by global scroll, enabling GPU-composited parallax. */
export function ParallaxSection({
  speed,
  children,
  className,
}: Readonly<ParallaxSectionProps>) {
  const offset = useParallax(speed);

  return (
    <div
      className={className}
      style={{ transform: `translate3d(0, ${offset}px, 0)` }}
    >
      {children}
    </div>
  );
}
