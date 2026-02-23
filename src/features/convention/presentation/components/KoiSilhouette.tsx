import { cn } from "@/shared/application/utils/cn";

interface KoiSilhouetteProps {
  readonly className?: string;
}

const PATH =
  "M4,30 L24,14 L48,4 L68,12 L100,14 L138,4 L128,30 L138,56 L100,46 L48,48 L24,46 Z";

export function KoiSilhouette({ className }: Readonly<KoiSilhouetteProps>) {
  return (
    <svg
      viewBox="0 0 144 60"
      className={cn("h-auto w-full", className)}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d={PATH} />
    </svg>
  );
}
