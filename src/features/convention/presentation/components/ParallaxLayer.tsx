import { useParallax } from "@/features/convention/application/hooks/useParallax";

interface ParallaxLayerProps {
  readonly speed: number;
  readonly children: React.ReactNode;
  readonly className?: string;
}

export function ParallaxLayer({
  speed,
  children,
  className,
}: Readonly<ParallaxLayerProps>) {
  const offset = useParallax(speed);

  return (
    <div
      className={className}
      style={{ transform: `translateY(${offset}px)` }}
      aria-hidden="true"
    >
      {children}
    </div>
  );
}
