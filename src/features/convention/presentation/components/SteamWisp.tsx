import { cn } from "@/shared/application/utils/cn";

interface SteamWispProps {
  readonly className?: string;
}

/** Decorative SVG of a thin rising steam wisp line for atmospheric hot-spring decoration. */
export function SteamWisp({ className }: Readonly<SteamWispProps>) {
  return (
    <svg
      viewBox="0 0 30 80"
      className={cn("h-auto w-full", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M15,80 Q10,60 18,45 Q25,30 12,15 Q8,5 15,0" opacity="0.6" />
      <path d="M20,80 Q15,55 22,40 Q28,25 18,10" opacity="0.3" />
    </svg>
  );
}
