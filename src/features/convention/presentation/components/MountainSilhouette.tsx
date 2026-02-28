import { cn } from "@/shared/application/utils/cn";

interface MountainSilhouetteProps {
  readonly className?: string;
  readonly variant?: "near" | "mid" | "far";
}

/** SVG path data for each mountain distance variant. */
const PATHS: Record<string, string> = {
  far: "M0,120 L60,55 L100,75 L180,25 L260,60 L340,35 L420,70 L500,20 L580,55 L660,40 L740,65 L800,120 Z",
  mid: "M0,120 L50,80 L90,95 L160,45 L230,75 L300,50 L380,85 L450,35 L530,65 L610,55 L690,80 L800,120 Z",
  near: "M0,120 L40,90 L80,100 L140,65 L200,85 L270,55 L340,90 L410,60 L480,80 L560,70 L640,95 L720,75 L800,120 Z",
};

/** Decorative SVG silhouette of a mountain range; `variant` controls perceived distance depth. */
export function MountainSilhouette({
  className,
  variant = "mid",
}: Readonly<MountainSilhouetteProps>) {
  return (
    <svg
      viewBox="0 0 800 120"
      preserveAspectRatio="none"
      className={cn("h-auto w-full", className)}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d={PATHS[variant]} />
    </svg>
  );
}
