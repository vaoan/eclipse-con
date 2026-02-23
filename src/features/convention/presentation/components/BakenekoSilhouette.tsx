import { cn } from "@/shared/application/utils/cn";

interface BakenekoSilhouetteProps {
  readonly className?: string;
}

const PATH =
  "M8,52 L24,40 L20,6 L34,30 L44,4 L52,32 L54,46 L74,18 L64,38 L80,12 L70,40 L60,56 L56,106 L24,106 L12,72 Z";

export function BakenekoSilhouette({
  className,
}: Readonly<BakenekoSilhouetteProps>) {
  return (
    <svg
      viewBox="0 0 86 112"
      className={cn("h-auto w-full", className)}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d={PATH} />
    </svg>
  );
}
