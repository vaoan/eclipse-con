import { type RefObject, useEffect, useState } from "react";

/**
 * Computes a parallax offset relative to a specific section element's position in the viewport.
 * Tracks how far the section's center deviates from the viewport center to calculate depth.
 * @param ref - Ref to the section container element.
 * @param speed - Depth multiplier; higher values increase movement range.
 * @param enabled - When `false`, offset is reset to zero and scroll listener is removed.
 * @returns The pixel offset to apply via CSS transform.
 */
export function useSectionParallax(
  ref: RefObject<HTMLElement | null>,
  speed = 0.3,
  enabled = true
) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setOffset(0);
      return;
    }

    let ticking = false;

    function handleScroll() {
      if (ticking) {
        return;
      }
      ticking = true;

      requestAnimationFrame(() => {
        const element = ref.current;
        if (!element) {
          ticking = false;
          return;
        }

        const rect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        if (rect.bottom > -200 && rect.top < viewportHeight + 200) {
          const sectionCenter = rect.top + rect.height / 2;
          const progress =
            (viewportHeight / 2 - sectionCenter) / viewportHeight;
          setOffset(progress * viewportHeight * speed);
        }

        ticking = false;
      });
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [enabled, ref, speed]);

  return offset;
}
