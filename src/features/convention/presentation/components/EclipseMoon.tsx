import { cn } from "@/shared/application/utils/cn";

interface EclipseMoonProps {
  readonly className?: string;
}

/** Renders an SVG eclipse moon graphic with concentric glow rings and a crescent shadow overlay. */
export function EclipseMoon({ className }: Readonly<EclipseMoonProps>) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={cn("h-auto w-full", className)}
      aria-hidden="true"
    >
      {/* Outer glow rings */}
      <circle
        cx="100"
        cy="100"
        r="95"
        fill="var(--color-accent)"
        opacity="0.03"
      />
      <circle
        cx="100"
        cy="100"
        r="80"
        fill="var(--color-accent)"
        opacity="0.06"
      />
      <circle
        cx="100"
        cy="100"
        r="65"
        fill="var(--color-accent)"
        opacity="0.1"
      />
      {/* Moon disc */}
      <circle
        cx="100"
        cy="100"
        r="50"
        fill="var(--color-accent)"
        opacity="0.35"
      />
      {/* Eclipse shadow — creates crescent */}
      <circle cx="118" cy="88" r="46" fill="var(--color-background)" />
      {/* Corona edge */}
      <circle
        cx="100"
        cy="100"
        r="52"
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="1.2"
        opacity="0.5"
      />
    </svg>
  );
}
