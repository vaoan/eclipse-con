import { useEffect, useState } from "react";

import { usePrefersReducedMotion } from "@/shared/application/hooks/usePrefersReducedMotion";

export function useParallax(speed = 0.3) {
  const [offset, setOffset] = useState(0);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
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
  }, [speed, prefersReducedMotion]);

  return offset;
}
