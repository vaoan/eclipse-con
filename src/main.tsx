import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "@/app/App";
import "@/shared/infrastructure/i18n/i18n";
import "@/index.css";
import { environment } from "@/shared/infrastructure/config/environment";
import { getStoredTrackingConsent } from "@/features/analytics/domain/consent";
import {
  initExtremeTracking,
  setAnalyticsConsentGranted,
} from "@/features/analytics/infrastructure/extremeTracking";

const root = document.querySelector("#root");
if (!root) {
  throw new Error("Root element not found");
}

const storedConsent = getStoredTrackingConsent();
setAnalyticsConsentGranted(Boolean(storedConsent?.categories.analytics));

initExtremeTracking({
  endpoint: environment.analyticsEndpoint,
  enabled: environment.analyticsEnabled,
  debug: environment.debug,
  posthogApiKey: environment.posthogApiKey,
  posthogHost: environment.posthogHost,
});

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
