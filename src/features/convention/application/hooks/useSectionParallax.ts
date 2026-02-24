import { type RefObject, useEffect, useState } from "react";

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
