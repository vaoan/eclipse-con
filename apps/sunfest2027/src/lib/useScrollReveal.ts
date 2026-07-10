import { useCallback, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/** Return type of {@link useScrollReveal}. */
interface ScrollReveal {
  readonly ref: (node: HTMLElement | null) => void;
  readonly revealed: boolean;
}

/**
 * Reveals an element once it scrolls into view. Returns `revealed: true`
 * immediately when reduced motion is preferred or IntersectionObserver is
 * unavailable, so content is never hidden without the observer — including
 * when the reduced-motion preference flips on after mount, since the
 * returned value is derived from the live preference rather than a value
 * only set once inside the observer callback.
 */
export function useScrollReveal(): ScrollReveal {
  const prefersReducedMotion = usePrefersReducedMotion();
  const supported = typeof IntersectionObserver !== "undefined";
  const [intersected, setIntersected] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  const ref = useCallback(
    (node: HTMLElement | null) => {
      observer.current?.disconnect();
      if (!node || prefersReducedMotion || !supported) {
        return;
      }
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            setIntersected(true);
            observer.current?.disconnect();
          }
        },
        { rootMargin: "0px 0px -12% 0px", threshold: 0.15 }
      );
      observer.current.observe(node);
    },
    [prefersReducedMotion, supported]
  );

  const revealed = intersected || prefersReducedMotion || !supported;

  return { ref, revealed };
}
