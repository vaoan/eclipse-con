import { useEffect } from "react";

import { environment } from "@/shared/infrastructure/config/environment";

const CLOUDFLARE_SCRIPT_ID = "cloudflare-web-analytics";
const CLOUDFLARE_BEACON_SOURCE =
  "https://static.cloudflareinsights.com/beacon.min.js";

interface CloudflareWebAnalyticsProps {
  readonly hasAnalyticsConsent: boolean;
}

function removeCloudflareScript() {
  document.getElementById(CLOUDFLARE_SCRIPT_ID)?.remove();
}

/** Loads the Cloudflare Web Analytics beacon only after analytics consent is granted. */
export function CloudflareWebAnalytics({
  hasAnalyticsConsent,
}: CloudflareWebAnalyticsProps) {
  useEffect(() => {
    const hasToken =
      environment.analyticsEnabled &&
      environment.cloudflareWebAnalyticsEnabled &&
      environment.cfWebAnalyticsToken.length > 0;

    if (!hasToken || !hasAnalyticsConsent) {
      removeCloudflareScript();
      return;
    }

    const existingScript = document.getElementById(CLOUDFLARE_SCRIPT_ID);
    if (existingScript) {
      return;
    }

    const script = document.createElement("script");
    script.id = CLOUDFLARE_SCRIPT_ID;
    script.defer = true;
    script.src = CLOUDFLARE_BEACON_SOURCE;
    // Cloudflare SPA auto-tracking does not support hash-based routers.
    script.dataset.cfBeacon = JSON.stringify({
      token: environment.cfWebAnalyticsToken,
      spa: false,
    });
    document.head.append(script);

    return () => {
      removeCloudflareScript();
    };
  }, [hasAnalyticsConsent]);

  return null;
}
