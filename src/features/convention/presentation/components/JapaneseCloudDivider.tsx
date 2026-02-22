import { cn } from "@/shared/application/utils/cn";

interface JapaneseCloudDividerProps {
  readonly className?: string;
  readonly flip?: boolean;
}

export function JapaneseCloudDivider({
  className,
  flip,
}: Readonly<JapaneseCloudDividerProps>) {
  return (
    <div
      className={cn("cloud-drift w-full overflow-hidden", className)}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className={cn("h-16 w-full md:h-24", flip && "rotate-180")}
        fill="var(--color-surface)"
      >
        <path d="M0,60 C150,20 300,80 450,50 C600,20 750,90 900,50 C1050,10 1150,70 1200,40 L1200,120 L0,120 Z" />
      </svg>
    </div>
  );
}
