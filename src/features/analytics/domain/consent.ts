export interface ConsentCategories {
  necessary: true;
  analytics: boolean;
}

export interface TrackingConsentState {
  version: number;
  updatedAt: string;
  source: "accept_all" | "reject_optional" | "customize";
  categories: ConsentCategories;
}

const CONSENT_KEY = "tracking_consent_v1";
const CONSENT_VERSION = 2;

export const DEFAULT_CONSENT_CATEGORIES: ConsentCategories = {
  necessary: true,
  analytics: false,
};

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
        parsedValue.source === "reject_optional" ||
        parsedValue.source === "customize"
          ? parsedValue.source
          : "customize",
      categories: {
        necessary: true,
        analytics: parsedValue.categories.analytics,
      },
    };
  } catch {
    return null;
  }
}

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
