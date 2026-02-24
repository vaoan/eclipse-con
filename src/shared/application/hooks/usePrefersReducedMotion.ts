import { useMediaQuery } from "@/shared/application/hooks/useMediaQuery";

export function usePrefersReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
