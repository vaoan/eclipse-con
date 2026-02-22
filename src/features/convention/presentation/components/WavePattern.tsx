import { cn } from "@/shared/application/utils/cn";

interface WavePatternProps {
  readonly className?: string;
}

export function WavePattern({ className }: Readonly<WavePatternProps>) {
  return (
    <div className={cn("w-full overflow-hidden", className)} aria-hidden="true">
      <svg
        viewBox="0 0 1200 80"
        preserveAspectRatio="none"
        className="h-10 w-full md:h-16"
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="1.5"
        opacity="0.3"
      >
        <path d="M0,40 Q75,10 150,40 T300,40 T450,40 T600,40 T750,40 T900,40 T1050,40 T1200,40" />
        <path d="M0,55 Q75,25 150,55 T300,55 T450,55 T600,55 T750,55 T900,55 T1050,55 T1200,55" />
        <path d="M0,25 Q75,-5 150,25 T300,25 T450,25 T600,25 T750,25 T900,25 T1050,25 T1200,25" />
      </svg>
    </div>
  );
}
