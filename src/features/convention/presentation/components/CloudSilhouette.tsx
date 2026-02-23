import { cn } from "@/shared/application/utils/cn";

interface CloudSilhouetteProps {
  readonly className?: string;
}

export function CloudSilhouette({ className }: Readonly<CloudSilhouetteProps>) {
  return (
    <svg
      viewBox="0 0 120 50"
      className={cn("h-auto w-full", className)}
      fill="currentColor"
      aria-hidden="true"
    >
      <ellipse cx="60" cy="35" rx="55" ry="14" />
      <ellipse cx="35" cy="25" rx="25" ry="15" />
      <ellipse cx="70" cy="22" rx="30" ry="18" />
      <ellipse cx="50" cy="28" rx="20" ry="12" />
    </svg>
  );
}
