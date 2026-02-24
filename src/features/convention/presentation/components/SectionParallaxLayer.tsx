interface SectionParallaxLayerProps {
  readonly speed: number;
  readonly children: React.ReactNode;
  readonly className?: string;
}

export function SectionParallaxLayer({
  children,
  className,
}: Readonly<SectionParallaxLayerProps>) {
  return (
    <div className={className} aria-hidden="true">
      <div className="relative h-full">{children}</div>
    </div>
  );
}
