import { useMediaQuery } from "@/shared/application/hooks/useMediaQuery";

/** Returns `true` when the user has enabled the "prefers-reduced-motion" OS setting. */
export function usePrefersReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
