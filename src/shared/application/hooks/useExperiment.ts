import { useEffect, useState } from "react";

import { trackExperimentExposure } from "@/features/analytics/infrastructure/trackingCustomEvents";

function pickVariant(variants: readonly [string, ...string[]]): string {
  // eslint-disable-next-line sonarjs/pseudo-random
  const index = Math.floor(Math.random() * variants.length);
  return variants[index] ?? variants[0];
}

/**
 * Assigns a sticky variant for an experiment, persisted in localStorage.
 * Fires `trackExperimentExposure` once on mount.
 * @param defaultVariant - variant assigned to new visitors (defaults to random if omitted)
 */
export function useExperiment(
  experimentId: string,
  variants: readonly [string, ...string[]],
  defaultVariant?: string
): string {
  const storageKey = `experiment:${experimentId}`;

  const [variant] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored && variants.includes(stored)) {
        return stored;
      }
    } catch {
      // ignore storage errors
    }
    const assigned =
      defaultVariant && variants.includes(defaultVariant)
        ? defaultVariant
        : pickVariant(variants);
    try {
      localStorage.setItem(storageKey, assigned);
    } catch {
      // ignore storage errors
    }
    return assigned;
  });

  useEffect(() => {
    trackExperimentExposure({ experimentId, variantId: variant });
  }, [experimentId, variant]);

  return variant;
}
