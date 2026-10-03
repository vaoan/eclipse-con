import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * Tracks an element's rendered width so SVG charts draw in real pixels (text
 * never scales with the viewport). Falls back to `fallback` where
 * ResizeObserver is missing (tests, very old browsers).
 *
 * @param fallback - Width before the first measurement.
 * @returns A ref for the element and its current width.
 */
export function useElementWidth<T extends HTMLElement>(
  fallback: number
): [RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === "undefined") {
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        setWidth(Math.max(240, Math.round(entry.contentRect.width)));
      }
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, []);
  return [ref, width];
}
