import { useState, type KeyboardEvent, type PointerEvent } from "react";

/** Hover/focus state for a crosshair chart and the handlers that drive it. */
export interface SeriesHover {
  /** Index of the highlighted x position, or null. */
  readonly active: number | null;
  /** Snap the crosshair to the x nearest the pointer. */
  readonly onPointerMove: (event: PointerEvent<SVGRectElement>) => void;
  /** ← → move the crosshair from the keyboard (same readout as hover). */
  readonly onKeyDown: (event: KeyboardEvent<SVGSVGElement>) => void;
  /** Hide the crosshair. */
  readonly clear: () => void;
}

/**
 * Crosshair state for a chart with `count` evenly spaced x positions.
 *
 * @param count - Number of x positions.
 * @returns The active index and the event handlers.
 */
export function useSeriesHover(count: number): SeriesHover {
  const [active, setActive] = useState<number | null>(null);
  const last = Math.max(0, count - 1);
  return {
    active,
    onPointerMove: (event) => {
      const box = event.currentTarget.getBoundingClientRect();
      const ratio = (event.clientX - box.left) / Math.max(1, box.width);
      setActive(Math.min(last, Math.max(0, Math.round(ratio * last))));
    },
    onKeyDown: (event) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
        return;
      }
      event.preventDefault();
      const step = event.key === "ArrowRight" ? 1 : -1;
      setActive((current) =>
        Math.min(last, Math.max(0, (current ?? -step) + step))
      );
    },
    clear: () => {
      setActive(null);
    },
  };
}
