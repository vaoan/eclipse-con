import { useEffect } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { TooltipProvider } from "@/components/ui/tooltip";
import { TrackingConsentGate } from "@/features/analytics/presentation/TrackingConsentGate";
import { environment } from "@/shared/infrastructure/config/environment";

interface AppProvidersProps {
  readonly children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const { i18n } = useTranslation();
  const isAnalyticsConfigured =
    environment.analyticsEnabled && environment.analyticsEndpoint.length > 0;

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
