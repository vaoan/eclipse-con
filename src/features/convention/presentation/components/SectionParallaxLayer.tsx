interface SectionParallaxLayerProps {
  readonly speed: number;
  readonly children: React.ReactNode;
  readonly className?: string;
}

/** Layout wrapper that positions children within an absolute decorative layer; `speed` prop is accepted but not wired (static rendering). */
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
