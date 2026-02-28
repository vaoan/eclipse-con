/** Represents the user's per-category tracking consent choices. */
export interface ConsentCategories {
  necessary: true;
  analytics: boolean;
}

/** Persisted consent record including the version, source action, and category choices. */
export interface TrackingConsentState {
  version: number;
  updatedAt: string;
  source: "accept_all" | "reject_optional";
  categories: ConsentCategories;
}

const CONSENT_KEY = "tracking_consent_v1";
const CONSENT_VERSION = 2;

/** Default consent categories applied before the user makes an explicit choice. */
export const DEFAULT_CONSENT_CATEGORIES: ConsentCategories = {
  necessary: true,
  analytics: false,
};

/**
 * Reads and validates the stored tracking consent state from `localStorage`.
 * @returns The parsed `TrackingConsentState` if valid, or `null` if absent or outdated.
 */
export function getStoredTrackingConsent(): TrackingConsentState | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(CONSENT_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as Partial<TrackingConsentState>;
    if (
      parsedValue.version !== CONSENT_VERSION ||
      !parsedValue.categories ||
      typeof parsedValue.categories.analytics !== "boolean"
    ) {
      return null;
    }

    return {
      version: CONSENT_VERSION,
      updatedAt:
        typeof parsedValue.updatedAt === "string"
          ? parsedValue.updatedAt
          : new Date().toISOString(),
      source:
        parsedValue.source === "accept_all" ||
        parsedValue.source === "reject_optional"
          ? parsedValue.source
          : "reject_optional",
      categories: {
        necessary: true,
        analytics: parsedValue.categories.analytics,
      },
    };
  } catch {
    return null;
  }
}

/**
 * Persists the user's consent decision to `localStorage` and returns the saved state.
 * @param categories - The optional consent categories chosen by the user.
 * @param source - Whether the user clicked "accept all" or "reject optional".
 * @returns The newly saved `TrackingConsentState`.
 */
export function saveTrackingConsent(
  categories: Omit<ConsentCategories, "necessary">,
  source: TrackingConsentState["source"]
): TrackingConsentState {
  const state: TrackingConsentState = {
    version: CONSENT_VERSION,
    updatedAt: new Date().toISOString(),
    source,
    categories: {
      necessary: true,
      analytics: categories.analytics,
    },
  };

  if (typeof window !== "undefined") {
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify(state));
  }

  return state;
}
