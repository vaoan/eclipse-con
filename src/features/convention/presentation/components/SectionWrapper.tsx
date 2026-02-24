import { type CSSProperties, useRef } from "react";
import { useSectionParallax } from "@/features/convention/application/hooks/useSectionParallax";
import { useIsMobileViewport } from "@/shared/application/hooks/useIsMobileViewport";
import { cn } from "@/shared/application/utils/cn";
import { tid } from "@/shared/application/utils/tid";

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
  const sectionRef = useRef<HTMLElement>(null);
  const isMobileViewport = useIsMobileViewport();
  const enableCloudParallax = !isMobileViewport;
  const cloudOffsetFar = useSectionParallax(
    sectionRef,
    0.9,
    enableCloudParallax
  );
  const cloudOffsetMid = useSectionParallax(
    sectionRef,
    0.5,
    enableCloudParallax
  );
  const cloudOffsetNear = useSectionParallax(
    sectionRef,
    0.28,
    enableCloudParallax
  );

  return (
    <section
      ref={sectionRef}
      id={id}
      className={cn(
        "section-surface relative overflow-hidden px-4 py-20 md:py-28",
        className
      )}
      {...tid(`section-${id}`)}
    >
      {enableCloudParallax ? (
        <>
          <div
            className="section-cloud-parallax section-cloud-parallax--far"
            style={
              {
                "--cloud-parallax-y": `${cloudOffsetFar}px`,
              } satisfies CSSProperties
            }
            aria-hidden="true"
          />
          <div
            className="section-cloud-parallax section-cloud-parallax--mid"
            style={
              {
                "--cloud-parallax-y": `${cloudOffsetMid}px`,
              } satisfies CSSProperties
            }
            aria-hidden="true"
          />
          <div
            className="section-cloud-parallax section-cloud-parallax--near"
            style={
              {
                "--cloud-parallax-y": `${cloudOffsetNear}px`,
              } satisfies CSSProperties
            }
            aria-hidden="true"
          />
        </>
      ) : null}
      {decorations}
      <div className="relative z-10 mx-auto max-w-6xl">{children}</div>
    </section>
  );
}
