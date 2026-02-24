import { useMediaQuery } from "@/shared/application/hooks/useMediaQuery";

const MOBILE_BREAKPOINT_QUERY = "(max-width: 768px)";

export function useIsMobileViewport() {
  return useMediaQuery(MOBILE_BREAKPOINT_QUERY);
}
