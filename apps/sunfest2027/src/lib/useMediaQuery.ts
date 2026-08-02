import { useSyncExternalStore } from "react";

/** Window shape where matchMedia may be absent (jsdom / older environments). */
interface MaybeMatchMedia {
  readonly matchMedia?: (query: string) => MediaQueryList;
}

/**
 * Subscribes to a CSS media query and reports whether it currently matches.
 * No-ops where `matchMedia` is unavailable, so it is safe under jsdom.
 *
 * @param query - A valid CSS media query string.
 * @returns `true` while the query matches, `false` otherwise.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      const win = window as unknown as MaybeMatchMedia;
      if (!win.matchMedia) {
        return () => undefined;
      }
      const mediaQuery = win.matchMedia(query);
      mediaQuery.addEventListener("change", onStoreChange);
      return () => {
        mediaQuery.removeEventListener("change", onStoreChange);
      };
    },
    () => {
      const win = window as unknown as MaybeMatchMedia;
      return win.matchMedia ? win.matchMedia(query).matches : false;
    },
    () => false
  );
}
