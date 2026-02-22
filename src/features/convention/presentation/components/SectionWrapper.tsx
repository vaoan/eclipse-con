import { cn } from "@/shared/application/utils/cn";
import { tid } from "@/shared/application/utils/tid";
import { useScrollReveal } from "@/features/convention/application/hooks/useScrollReveal";

interface SectionWrapperProps {
  readonly id: string;
  readonly children: React.ReactNode;
  readonly className?: string;
}

export function SectionWrapper({
  id,
  children,
  className,
}: Readonly<SectionWrapperProps>) {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section
      id={id}
      ref={ref}
      className={cn(
        "relative px-4 py-20 md:py-28",
        isVisible ? "reveal-visible" : "reveal-hidden",
        className
      )}
      {...tid(`section-${id}`)}
    >
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}
