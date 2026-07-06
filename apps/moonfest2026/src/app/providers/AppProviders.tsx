import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { TooltipProvider } from "@/shared/presentation/ui/tooltip";
import { CloudflareWebAnalytics } from "@/features/analytics/presentation/CloudflareWebAnalytics";
import { GoogleAnalytics } from "@/features/analytics/presentation/GoogleAnalytics";
import { GoogleTagManager } from "@/features/analytics/presentation/GoogleTagManager";
import { TrackingConsentGate } from "@/features/analytics/presentation/TrackingConsentGate";
import {
  getStoredTrackingConsent,
  TRACKING_CONSENT_UPDATED_EVENT,
  type TrackingConsentState,
} from "@/features/analytics/domain/consent";
import { environment } from "@/shared/infrastructure/config/environment";

interface AppProvidersProps {
  readonly children: ReactNode;
}

/** Wraps the application with global UI providers: `TooltipProvider`, `TrackingConsentGate`, and the i18n language sync effect. */
export function AppProviders({ children }: AppProvidersProps) {
  const { i18n } = useTranslation();
  const [consent, setConsent] = useState<TrackingConsentState | null>(() =>
    getStoredTrackingConsent()
  );
  const hasCloudflareWebAnalytics =
    environment.cloudflareWebAnalyticsEnabled &&
    environment.cfWebAnalyticsToken.length > 0;
  const hasGoogleAnalytics =
    environment.googleAnalyticsEnabled &&
    environment.gaMeasurementId.length > 0;
  const hasPosthog =
    environment.posthogApiKey.length > 0 && environment.posthogHost.length > 0;
  const hasAnalyticsConsent = Boolean(consent?.categories.analytics);
  const isAnalyticsConfigured =
    environment.analyticsEnabled &&
    (environment.analyticsEndpoint.length > 0 ||
      hasCloudflareWebAnalytics ||
      hasGoogleAnalytics ||
      hasPosthog);

  useEffect(() => {
    const language = i18n.resolvedLanguage ?? i18n.language;
    document.documentElement.lang = language.startsWith("en") ? "en" : "es";
  }, [i18n.language, i18n.resolvedLanguage]);

  useEffect(() => {
    const syncConsent = () => {
      setConsent(getStoredTrackingConsent());
    };

    const syncConsentFromStorage = (event: StorageEvent) => {
      if (event.key && event.key !== "tracking_consent_v1") {
        return;
      }

      syncConsent();
    };

    window.addEventListener(TRACKING_CONSENT_UPDATED_EVENT, syncConsent);
    window.addEventListener("storage", syncConsentFromStorage);
    return () => {
      window.removeEventListener(TRACKING_CONSENT_UPDATED_EVENT, syncConsent);
      window.removeEventListener("storage", syncConsentFromStorage);
    };
  }, []);

  return (
    <TooltipProvider>
      {children}
      <GoogleAnalytics
        hasAnalyticsConsent={hasAnalyticsConsent}
        hasConsentDecision={consent !== null}
      />
      <GoogleTagManager />
      <CloudflareWebAnalytics hasAnalyticsConsent={hasAnalyticsConsent} />
      <TrackingConsentGate blockingEnabled={isAnalyticsConfigured} />
    </TooltipProvider>
  );
}
