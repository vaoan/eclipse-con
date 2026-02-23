import { cn } from "@/shared/application/utils/cn";

interface TanukiSilhouetteProps {
  readonly className?: string;
}

const PATH =
  "M14,46 L26,36 L26,22 L36,30 L42,20 L52,32 L60,44 L84,20 L74,40 L68,58 L65,95 L25,95 L16,68 Z";

export function TanukiSilhouette({
  className,
}: Readonly<TanukiSilhouetteProps>) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("h-auto w-full", className)}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d={PATH} />
    </svg>
  );
}
