import { useEffect } from "react";

import { environment } from "@/shared/infrastructure/config/environment";
import { updateGoogleAnalyticsConsent } from "@/features/analytics/presentation/googleConsent";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...arguments_: unknown[]) => void;
  }
}

const GOOGLE_TAG_SCRIPT_ID = "google-analytics-gtag";
const GOOGLE_TAG_INLINE_SCRIPT_ID = "google-analytics-inline";
const EEA_UK_CH_REGION_CODES = [
  "AT",
  "BE",
  "BG",
  "CH",
  "CY",
  "CZ",
  "DE",
  "DK",
  "EE",
  "ES",
  "FI",
  "FR",
  "GB",
  "GR",
  "HR",
  "HU",
  "IE",
  "IS",
  "IT",
  "LI",
  "LT",
  "LU",
  "LV",
  "MT",
  "NL",
  "NO",
  "PL",
  "PT",
  "RO",
  "SE",
  "SI",
  "SK",
] as const;

interface GoogleAnalyticsProps {
  readonly hasAnalyticsConsent: boolean;
  readonly hasConsentDecision: boolean;
}

function removeGoogleAnalyticsScripts() {
  document.getElementById(GOOGLE_TAG_SCRIPT_ID)?.remove();
  document.getElementById(GOOGLE_TAG_INLINE_SCRIPT_ID)?.remove();
}

function sendPageView(measurementId: string) {
  const pagePath = `${window.location.pathname}${window.location.search}`;
  window.gtag?.("event", "page_view", {
    send_to: measurementId,
    page_title: document.title,
    page_location: window.location.href,
    page_path: pagePath,
  });
}

/**
 * Loads GA4 with regional consent defaults.
 * EEA/UK/CH start denied, while other regions start analytics-granted.
 * Ads-related storage stays denied everywhere.
 */
export function GoogleAnalytics({
  hasAnalyticsConsent,
  hasConsentDecision,
}: GoogleAnalyticsProps) {
  useEffect(() => {
    const hasMeasurementId =
      environment.analyticsEnabled &&
      environment.googleAnalyticsEnabled &&
      environment.gaMeasurementId.length > 0;

    if (!hasMeasurementId) {
      removeGoogleAnalyticsScripts();
      return;
    }

    if (!document.getElementById(GOOGLE_TAG_SCRIPT_ID)) {
      const externalScript = document.createElement("script");
      externalScript.id = GOOGLE_TAG_SCRIPT_ID;
      externalScript.async = true;
      externalScript.src = `https://www.googletagmanager.com/gtag/js?id=${environment.gaMeasurementId}`;
      document.head.append(externalScript);
    }

    if (!document.getElementById(GOOGLE_TAG_INLINE_SCRIPT_ID)) {
      const inlineScript = document.createElement("script");
      inlineScript.id = GOOGLE_TAG_INLINE_SCRIPT_ID;
      inlineScript.text = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('consent', 'default', {
          analytics_storage: 'granted',
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied'
        });
        gtag('consent', 'default', {
          analytics_storage: 'denied',
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
          region: ${JSON.stringify(EEA_UK_CH_REGION_CODES)}
        });
        gtag('config', '${environment.gaMeasurementId}', {
          send_page_view: false
        });
      `;
      document.head.append(inlineScript);
    }

    if (hasConsentDecision) {
      updateGoogleAnalyticsConsent(hasAnalyticsConsent);
    }

    const onRouteChange = () => {
      sendPageView(environment.gaMeasurementId);
    };

    const onWindowLoad = () => {
      sendPageView(environment.gaMeasurementId);
    };

    if (document.readyState === "complete") {
      sendPageView(environment.gaMeasurementId);
    } else {
      window.addEventListener("load", onWindowLoad, { once: true });
    }

    window.addEventListener("analytics:navigation", onRouteChange);
    window.addEventListener("popstate", onRouteChange);

    return () => {
      window.removeEventListener("load", onWindowLoad);
      window.removeEventListener("analytics:navigation", onRouteChange);
      window.removeEventListener("popstate", onRouteChange);
    };
  }, [hasAnalyticsConsent, hasConsentDecision]);

  return null;
}
