import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { tid } from "@/lib/tid";

/** Props for {@link SectionWrapper}. */
interface SectionWrapperProps {
  readonly id: string;
  readonly children: ReactNode;
  readonly className?: string;
  readonly decorations?: ReactNode;
  readonly surfaceTone?: "deep" | "elevated";
}

/**
 * Full-width `<section>` with consistent padding and an alternating surface
 * tone. `deep` paints an opaque carnaval surface; `elevated` is translucent so
 * the fixed background tint shows through, giving the page depth between bands.
 */
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
        "section-surface relative scroll-mt-20 overflow-hidden px-4 py-20 md:py-28",
        surfaceTone === "elevated"
          ? "section-surface--elevated"
          : "section-surface--deep",
        className
      )}
      data-surface-tone={surfaceTone}
      data-testid={tid(`section-${id}`)}
    >
      {decorations}
      <div className="relative z-10 mx-auto max-w-6xl">{children}</div>
    </section>
  );
}
