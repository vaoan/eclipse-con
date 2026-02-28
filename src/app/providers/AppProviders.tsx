import { useEffect } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { TooltipProvider } from "@/shared/presentation/ui/tooltip";
import { TrackingConsentGate } from "@/features/analytics/presentation/TrackingConsentGate";
import { environment } from "@/shared/infrastructure/config/environment";

interface AppProvidersProps {
  readonly children: ReactNode;
}

/** Wraps the application with global UI providers: `TooltipProvider`, `TrackingConsentGate`, and the i18n language sync effect. */
export function AppProviders({ children }: AppProvidersProps) {
  const { i18n } = useTranslation();
  const hasPosthog =
    environment.posthogApiKey.length > 0 && environment.posthogHost.length > 0;
  const isAnalyticsConfigured =
    environment.analyticsEnabled &&
    (environment.analyticsEndpoint.length > 0 || hasPosthog);

  useEffect(() => {
    const language = i18n.language || "es";
    document.documentElement.lang = language.startsWith("en") ? "en" : "es";
  }, [i18n.language]);

  return (
    <TooltipProvider>
      {children}
      <TrackingConsentGate blockingEnabled={isAnalyticsConfigured} />
    </TooltipProvider>
  );
}
