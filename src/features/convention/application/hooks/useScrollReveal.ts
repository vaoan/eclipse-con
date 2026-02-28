import { useEffect, useRef, useState } from "react";

/** Internal reveal state: `pending` before observer fires, `hidden` when off-screen, `visible` once intersected. */
type RevealState = "pending" | "hidden" | "visible";

/**
 * Uses an `IntersectionObserver` to reveal an element when it enters the viewport.
 * Once visible, the observer is detached to avoid redundant callbacks.
 * @param threshold - Fraction of the element that must be visible to trigger.
 * @returns An object with a `ref` to attach to the target element and the current `state`.
 */
export function useScrollReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<RevealState>("pending");

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setState("visible");
          observer.unobserve(element);
        } else {
          setState("hidden");
        }
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold]);

  return { ref, state };
}
