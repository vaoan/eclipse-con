import { cn } from "@/shared/application/utils/cn";

interface KodamaSilhouetteProps {
  readonly className?: string;
}

export function KodamaSilhouette({
  className,
}: Readonly<KodamaSilhouetteProps>) {
  return (
    <svg
      viewBox="0 0 40 60"
      className={cn("h-auto w-full", className)}
      fill="currentColor"
      aria-hidden="true"
    >
      {/* Big round head */}
      <circle cx="20" cy="18" r="16" />
      {/* Small body */}
      <path d="M14,32 Q12,48 16,54 L24,54 Q28,48 26,32Z" />
      {/* Little arms */}
      <path
        d="M14,36 Q8,38 6,42"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M26,36 Q32,38 34,42"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Eyes — hollow circles */}
      <circle
        cx="13"
        cy="16"
        r="3"
        fill="var(--color-background)"
        opacity="0.5"
      />
      <circle
        cx="27"
        cy="16"
        r="3"
        fill="var(--color-background)"
        opacity="0.5"
      />
      {/* Mouth — small open oval */}
      <ellipse
        cx="20"
        cy="25"
        rx="2.5"
        ry="3"
        fill="var(--color-background)"
        opacity="0.4"
      />
    </svg>
  );
}
