import { cn } from "@/shared/application/utils/cn";

interface ToriiGateSilhouetteProps {
  readonly className?: string;
}

export function ToriiGateSilhouette({
  className,
}: Readonly<ToriiGateSilhouetteProps>) {
  return (
    <svg
      viewBox="0 0 200 220"
      className={cn("h-auto w-full", className)}
      fill="currentColor"
      aria-hidden="true"
    >
      {/* Top beam (kasagi) */}
      <rect x="10" y="20" width="180" height="12" rx="2" />
      {/* Second beam (nuki) */}
      <rect x="25" y="42" width="150" height="8" rx="1" />
      {/* Left pillar */}
      <rect x="35" y="32" width="14" height="188" />
      {/* Right pillar */}
      <rect x="151" y="32" width="14" height="188" />
      {/* Overhangs */}
      <rect x="0" y="14" width="200" height="8" rx="4" />
    </svg>
  );
}
