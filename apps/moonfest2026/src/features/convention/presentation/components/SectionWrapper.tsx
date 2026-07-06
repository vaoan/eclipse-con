import { cn } from "@/shared/application/utils/cn";
import { tid } from "@/shared/application/utils/tid";

interface SectionWrapperProps {
  readonly id: string;
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly decorations?: React.ReactNode;
  readonly surfaceTone?: "deep" | "elevated";
}

/** Full-width `<section>` container with consistent padding, overflow handling, and an optional decorations slot. */
export function SectionWrapper({
  id,
  children,
  className,
  decorations,
  surfaceTone = "deep",
}: Readonly<SectionWrapperProps>) {
  return (
    <section
      id={id}
      className={cn(
        "section-surface relative overflow-hidden px-4 py-20 md:py-28",
        surfaceTone === "elevated"
          ? "section-surface--elevated"
          : "section-surface--deep",
        className
      )}
      data-surface-tone={surfaceTone}
      {...tid(`section-${id}`)}
    >
      {decorations}
      <div className="relative z-10 mx-auto max-w-6xl">{children}</div>
    </section>
  );
}
