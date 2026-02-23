import { useRef } from "react";

import { useSectionParallax } from "@/features/convention/application/hooks/useSectionParallax";

interface SectionParallaxLayerProps {
  readonly speed: number;
  readonly children: React.ReactNode;
  readonly className?: string;
}

export function SectionParallaxLayer({
  speed,
  children,
  className,
}: Readonly<SectionParallaxLayerProps>) {
  const ref = useRef<HTMLDivElement>(null);
  const offset = useSectionParallax(ref, speed);

  return (
    <div ref={ref} className={className} aria-hidden="true">
      <div
        className="relative h-full"
        style={{ transform: `translateY(${offset}px)` }}
      >
        {children}
      </div>
    </div>
  );
}
