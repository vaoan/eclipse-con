import { useEffect, useState } from "react";

import { useIsMobileViewport } from "@/shared/application/hooks/useIsMobileViewport";
import { usePrefersReducedMotion } from "@/shared/application/hooks/usePrefersReducedMotion";

/**
 * Computes a vertical scroll offset that creates a global parallax effect.
 * Disabled automatically on mobile viewports and when reduced motion is preferred.
 * @param speed - Multiplier applied to `window.scrollY`; higher values move faster.
 * @returns The pixel offset to apply via CSS `translateY`.
 */
export function useParallax(speed = 0.3) {
  const [offset, setOffset] = useState(0);
  const prefersReducedMotion = usePrefersReducedMotion();
  const isMobileViewport = useIsMobileViewport();

  useEffect(() => {
    if (prefersReducedMotion || isMobileViewport) {
      setOffset(0);
      return undefined;
    }

    let ticking = false;

    function handleScroll() {
      if (ticking) {
        return;
      }
      ticking = true;

      requestAnimationFrame(() => {
        setOffset(window.scrollY * speed);

        ticking = false;
      });
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [speed, prefersReducedMotion, isMobileViewport]);

  return offset;
}
