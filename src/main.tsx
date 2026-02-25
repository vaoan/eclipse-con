import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "@/app/App";
import "@/shared/infrastructure/i18n/i18n";
import "@/index.css";
import { environment } from "@/shared/infrastructure/config/environment";

function initCloudflareAnalytics(token: string) {
  if (!token || typeof document === "undefined") {
    return;
  }

  if (document.querySelector("script[data-cf-beacon]")) {
    return;
  }

  // eslint-disable-next-line sonarjs/disabled-resource-integrity
  const script = document.createElement("script");
  script.defer = true;
  script.src = "https://static.cloudflareinsights.com/beacon.min.js";
  script.dataset.cfBeacon = JSON.stringify({ token });
  document.head.appendChild(script);
}

const root = document.querySelector("#root");
if (!root) {
  throw new Error("Root element not found");
}

initCloudflareAnalytics(environment.cloudflareAnalyticsToken);

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
