import { useEffect, useState } from "react";

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
  const [matches, setMatches] = useState(() => getMatches(query));

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const mediaQuery = window.matchMedia(query);
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    setMatches(mediaQuery.matches);

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [query]);

  return matches;
}
