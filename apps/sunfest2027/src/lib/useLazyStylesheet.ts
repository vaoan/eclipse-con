import { useCallback, useRef } from "react";

/**
 * Loads a stylesheet only once the element carrying the returned ref comes near
 * the viewport.
 *
 * Used for the Ofelia faces, which cost ~118KB and dress a single section far
 * down the page. Linking them in `index.html` made every visitor pay for them
 * up front, competing with the hero image for bandwidth; this way they are
 * fetched while that section is still approaching, and never at all for someone
 * who does not scroll that far.
 *
 * @param href - Stylesheet URL to load.
 * @param rootMargin - How early to start loading, ahead of the element. The
 *   recap sits directly below the hero, so anything generous here fires on
 *   landing and defeats the point; the section is a full screen tall, which
 *   gives the fetch plenty of lead time once its top edge appears.
 * @returns A ref callback to attach to the element that needs the stylesheet.
 */
export function useLazyStylesheet(
  href: string,
  rootMargin = "0px"
): (node: Element | null) => void {
  const loaded = useRef(false);
  const observer = useRef<IntersectionObserver | null>(null);

  return useCallback(
    (node: Element | null) => {
      const load = () => {
        if (loaded.current) {
          return;
        }
        loaded.current = true;
        if (!document.querySelector(`link[href="${href}"]`)) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = href;
          document.head.append(link);
        }
      };

      observer.current?.disconnect();
      observer.current = null;

      if (!node || loaded.current) {
        return;
      }

      // Without the observer, fall back to loading it immediately: a missing
      // typeface is worse than an early request.
      if (typeof IntersectionObserver === "undefined") {
        load();
        return;
      }

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            load();
            observer.current?.disconnect();
            observer.current = null;
          }
        },
        { rootMargin }
      );
      observer.current.observe(node);
    },
    [href, rootMargin]
  );
}
