import { cn } from "@/shared/application/utils/cn";

interface LanternSilhouetteProps {
  readonly className?: string;
}

/** Decorative SVG silhouette of a traditional hanging paper lantern. */
export function LanternSilhouette({
  className,
}: Readonly<LanternSilhouetteProps>) {
  return (
    <svg
      viewBox="0 0 40 80"
      className={cn("h-auto w-full", className)}
      fill="currentColor"
      aria-hidden="true"
    >
      {/* Hanging cord */}
      <rect x="19" y="0" width="2" height="16" rx="1" />
      {/* Top cap */}
      <rect x="12" y="14" width="16" height="4" rx="2" />
      {/* Body */}
      <ellipse cx="20" cy="40" rx="16" ry="22" />
      {/* Bottom cap */}
      <rect x="13" y="59" width="14" height="4" rx="2" />
      {/* Tassel cord */}
      <rect x="18" y="63" width="4" height="8" rx="2" />
      {/* Tassel */}
      <path d="M16,71 L16,79 L18,77 L20,79 L22,77 L24,79 L24,71 Z" />
    </svg>
  );
}
