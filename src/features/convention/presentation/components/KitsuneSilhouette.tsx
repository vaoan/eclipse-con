import { cn } from "@/shared/application/utils/cn";

interface KitsuneSilhouetteProps {
  readonly className?: string;
  readonly variant?: "sitting" | "trotting";
}

const SITTING =
  "M10,50 L25,38 L20,8 L35,25 L45,4 L55,30 L60,40 L90,10 L75,35 L65,55 L60,95 L30,95 L15,65 Z";

const TROTTING =
  "M5,32 L20,24 L18,5 L28,18 L36,2 L44,20 L70,17 L120,4 L110,18 L98,27 L94,67 L70,38 L50,67 L20,43 Z";

export function KitsuneSilhouette({
  className,
  variant = "sitting",
}: Readonly<KitsuneSilhouetteProps>) {
  const isTrotting = variant === "trotting";

  return (
    <svg
      viewBox={isTrotting ? "0 0 130 72" : "0 0 100 100"}
      className={cn("h-auto w-full", className)}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d={isTrotting ? TROTTING : SITTING} />
    </svg>
  );
}
