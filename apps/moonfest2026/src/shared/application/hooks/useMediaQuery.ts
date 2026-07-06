import { useSyncExternalStore } from "react";

const noop = () => undefined;

function getMatches(query: string) {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia(query).matches;
}

/**
 * Subscribes to a CSS media query and returns whether it currently matches.
 * Re-renders when the match state changes.
 * @param query - A valid CSS media query string.
 * @returns `true` while the media query matches, `false` otherwise.
 */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") {
        return noop;
      }

      const mediaQuery = window.matchMedia(query);
      mediaQuery.addEventListener("change", onStoreChange);

      return () => {
        mediaQuery.removeEventListener("change", onStoreChange);
      };
    },
    () => getMatches(query),
    () => false
  );
}
