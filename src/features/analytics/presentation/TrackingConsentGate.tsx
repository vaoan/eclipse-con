import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  getStoredTrackingConsent,
  saveTrackingConsent,
  type ConsentCategories,
  type TrackingConsentState,
} from "@/features/analytics/domain/consent";
import {
  setAnalyticsConsentGranted,
  trackConsentPreference,
} from "@/features/analytics/infrastructure/extremeTracking";
import { LanguageToggle } from "@/features/convention/presentation/components/LanguageToggle";
import moonfestLogo from "@/shared/presentation/assets/moonfest-logo.svg";

interface TrackingConsentGateProps {
  readonly blockingEnabled?: boolean;
}

function ConsentInfo() {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-accent/35 bg-background/70 px-4 py-3">
        <p className="text-sm font-semibold text-foreground">
          {t("convention.consent.categories.necessary.title")}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {t("convention.consent.categories.necessary.description")}
        </p>
      </div>
      <div className="rounded-xl border border-white/10 bg-surface/75 px-4 py-3">
        <p className="text-sm font-semibold text-foreground">
          {t("convention.consent.categories.analytics.title")}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {t("convention.consent.categories.analytics.description")}
        </p>
      </div>
    </div>
  );
}

function ConsentModalHeader() {
  const { t } = useTranslation();

  return (
    <div className="relative border-b border-accent/25 bg-gradient-to-r from-primary/30 via-surface-elevated to-accent/20 px-5 py-5 sm:px-6 sm:py-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(201,168,76,0.26),transparent_48%),radial-gradient(circle_at_88%_0%,rgba(255,255,255,0.08),transparent_42%)]" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-2 sm:block">
            <div className="inline-flex items-center gap-3 rounded-full border border-accent/35 bg-black/20 px-3 py-1.5">
              <img
                src={moonfestLogo}
                alt={t("convention.hero.logoAlt")}
                className="h-7 w-auto"
                loading="lazy"
              />
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.34em] text-accent">
                {t("convention.consent.title")}
              </p>
            </div>
            <div className="sm:hidden">
              <LanguageToggle />
            </div>
          </div>
          <h2 className="mt-4 max-w-2xl text-2xl leading-snug font-black text-foreground sm:text-[2rem]">
            {t("convention.consent.headline")}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-foreground/85 sm:text-base">
            {t("convention.consent.description")}
          </p>
        </div>
        <div className="hidden sm:block shrink-0 sm:pt-1">
          <LanguageToggle />
        </div>
      </div>
    </div>
  );
}

function useConsentState(blockingEnabled: boolean) {
  const initialValue = useMemo(() => getStoredTrackingConsent(), []);
  const [savedConsent, setSavedConsent] = useState<TrackingConsentState | null>(
    initialValue
  );
  const [isModalOpen, setModalOpen] = useState<boolean>(
    blockingEnabled && !initialValue
  );

  useEffect(() => {
    setAnalyticsConsentGranted(Boolean(savedConsent?.categories.analytics));
  }, [savedConsent]);

  useEffect(() => {
    const shouldLockScroll = isModalOpen || (blockingEnabled && !savedConsent);
    if (!shouldLockScroll) {
      return undefined;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [blockingEnabled, isModalOpen, savedConsent]);

  const persist = (
    categories: Omit<ConsentCategories, "necessary">,
    source: TrackingConsentState["source"]
  ) => {
    const savedValue = saveTrackingConsent(categories, source);
    trackConsentPreference({
      source: savedValue.source,
      analytics: savedValue.categories.analytics,
      updatedAt: savedValue.updatedAt,
    });
    setSavedConsent(savedValue);
    setModalOpen(false);
  };

  const acceptAll = () => {
    persist(
      {
        analytics: true,
      },
      "accept_all"
    );
  };

  const rejectOptional = () => {
    persist(
      {
        analytics: false,
      },
      "reject_optional"
    );
  };

  const openConsentModal = () => {
    setModalOpen(true);
  };

  return {
    acceptAll,
    isModalOpen,
    openConsentModal,
    rejectOptional,
    savedConsent,
  };
}

export function TrackingConsentGate({
  blockingEnabled = true,
}: TrackingConsentGateProps) {
  const { t } = useTranslation();
  const { acceptAll, isModalOpen, openConsentModal, rejectOptional } =
    useConsentState(blockingEnabled);

  if (!isModalOpen) {
    return (
      <div className="pointer-events-none fixed right-3 bottom-3 z-40">
        <Button
          aria-label={t("convention.consent.manage")}
          className="pointer-events-auto size-11 border border-accent/60 bg-surface text-accent shadow-[0_0_16px_rgba(201,168,76,0.35)] hover:bg-accent hover:text-accent-foreground focus-visible:ring-accent/70"
          onClick={openConsentModal}
          size="icon"
          type="button"
          variant="outline"
          data-cta-id="consent_manage"
          data-content-id="consent_modal"
          data-content-section="consent"
        >
          <ShieldCheck className="size-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(201,168,76,0.2),transparent_45%),linear-gradient(180deg,rgba(10,11,26,0.75),rgba(10,11,26,0.95))]" />
      <section className="relative z-10 flex max-h-[min(94vh,820px)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-accent/35 bg-surface/95 shadow-[0_0_40px_rgba(201,168,76,0.25)]">
        <ConsentModalHeader />

        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
          <div>
            <ConsentInfo />
          </div>
        </div>
        <div className="border-t border-white/10 bg-surface/90 px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-col items-center gap-3">
            <Button
              variant="ghost"
              className="relative w-full overflow-hidden bg-accent py-7 text-lg font-black uppercase tracking-[0.22em] text-accent-foreground transition-all duration-300 before:absolute before:inset-0 before:-translate-x-full before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)] before:transition-transform before:duration-700 hover:scale-[1.015] hover:bg-accent hover:brightness-110 hover:text-accent-foreground hover:before:translate-x-full focus-visible:ring-accent/90"
              onClick={acceptAll}
              type="button"
              data-cta-id="consent_accept_all"
              data-content-id="consent_accept_all"
              data-content-section="consent"
            >
              {t("convention.consent.acceptAll")}
            </Button>
            <button
              className="cursor-pointer bg-transparent text-[0.72rem] font-normal text-foreground/30 underline-offset-2 transition-colors duration-200 hover:text-foreground/50 focus-visible:outline-none focus-visible:text-foreground/50"
              onClick={rejectOptional}
              type="button"
              data-cta-id="consent_reject"
              data-content-id="consent_reject"
              data-content-section="consent"
            >
              {t("convention.consent.rejectOptional")}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
