import { cn } from "@/shared/application/utils/cn";

interface CraneSilhouetteProps {
  readonly className?: string;
}

const PATH =
  "M70,2 L98,18 L136,26 L98,34 L78,38 L70,66 L62,38 L42,34 L4,26 L42,18 Z";

export function CraneSilhouette({ className }: Readonly<CraneSilhouetteProps>) {
  return (
    <svg
      viewBox="0 0 140 70"
      className={cn("h-auto w-full", className)}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d={PATH} />
    </svg>
  );
}
