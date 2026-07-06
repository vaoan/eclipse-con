import { useMediaQuery } from "@/shared/application/hooks/useMediaQuery";

/** Media query string used to detect mobile viewport width (≤768px). */
const MOBILE_BREAKPOINT_QUERY = "(max-width: 768px)";

/** Returns `true` when the viewport width is at or below the mobile breakpoint. */
export function useIsMobileViewport() {
  return useMediaQuery(MOBILE_BREAKPOINT_QUERY);
}
