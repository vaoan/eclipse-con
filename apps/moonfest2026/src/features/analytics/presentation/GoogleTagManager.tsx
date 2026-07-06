import { useEffect } from "react";

import { environment } from "@/shared/infrastructure/config/environment";

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

const GOOGLE_TAG_MANAGER_SCRIPT_ID = "google-tag-manager";

function removeGoogleTagManagerScript() {
  document.getElementById(GOOGLE_TAG_MANAGER_SCRIPT_ID)?.remove();
}

/** Loads a GTM container when analytics are enabled and a container ID is configured. */
export function GoogleTagManager() {
  useEffect(() => {
    const hasContainerId =
      environment.analyticsEnabled &&
      environment.googleTagManagerEnabled &&
      environment.gtmContainerId.length > 0;

    if (!hasContainerId) {
      removeGoogleTagManagerScript();
      return;
    }

    window.dataLayer ??= [];

    if (!document.getElementById(GOOGLE_TAG_MANAGER_SCRIPT_ID)) {
      window.dataLayer.push({
        "gtm.start": Date.now(),
        event: "gtm.js",
      });

      const script = document.createElement("script");
      script.id = GOOGLE_TAG_MANAGER_SCRIPT_ID;
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtm.js?id=${environment.gtmContainerId}`;
      document.head.append(script);
    }
  }, []);

  return null;
}
