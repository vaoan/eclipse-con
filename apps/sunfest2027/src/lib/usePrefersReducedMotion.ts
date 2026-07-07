import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/** Window shape where matchMedia may be absent (jsdom / older environments). */
interface MaybeMatchMedia {
  readonly matchMedia?: (query: string) => MediaQueryList;
}

/** Subscribe to reduced-motion changes; no-ops where matchMedia is unavailable. */
function subscribe(callback: () => void): () => void {
  const win = window as unknown as MaybeMatchMedia;
  if (!win.matchMedia) {
    return () => undefined;
  }
  const mql = win.matchMedia(QUERY);
  mql.addEventListener("change", callback);
  return () => {
    mql.removeEventListener("change", callback);
  };
}

/** Current reduced-motion preference, or false where matchMedia is unavailable. */
function getSnapshot(): boolean {
  const win = window as unknown as MaybeMatchMedia;
  return win.matchMedia ? win.matchMedia(QUERY).matches : false;
}

/** Returns `true` when the user has enabled the "prefers-reduced-motion" OS setting. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
