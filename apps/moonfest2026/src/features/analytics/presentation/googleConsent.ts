/**
 * Updates Google Consent Mode so GA/GTM react immediately to the user's analytics choice.
 * Ads-related storage remains denied everywhere.
 */
export function updateGoogleAnalyticsConsent(hasAnalyticsConsent: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  window.gtag?.("consent", "update", {
    analytics_storage: hasAnalyticsConsent ? "granted" : "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
}
