import { cn } from "@/shared/application/utils/cn";
import { tid } from "@/shared/application/utils/tid";
import { useScrollReveal } from "@/features/convention/application/hooks/useScrollReveal";

interface SectionWrapperProps {
  readonly id: string;
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly decorations?: React.ReactNode;
}

export function SectionWrapper({
  id,
  children,
  className,
  decorations,
}: Readonly<SectionWrapperProps>) {
  const { ref, state } = useScrollReveal();

  return (
    <section
      id={id}
      ref={ref}
      className={cn(
        "relative z-10 overflow-hidden bg-surface px-4 py-20 md:py-28",
        state === "hidden" && "reveal-hidden",
        state === "visible" && "reveal-visible",
        className
      )}
      {...tid(`section-${id}`)}
    >
      {decorations}
      <div className="relative z-10 mx-auto max-w-6xl">{children}</div>
    </section>
  );
}
