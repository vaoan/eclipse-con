import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DEFAULT_CONSENT_CATEGORIES,
  getStoredTrackingConsent,
  saveTrackingConsent,
  type ConsentCategories,
  type TrackingConsentState,
} from "@/features/analytics/domain/consent";
import {
  setAnalyticsConsentGranted,
  trackConsentPreference,
} from "@/features/analytics/infrastructure/extremeTracking";
import { trackContentInteraction } from "@/features/analytics/infrastructure/trackingCustomEvents";
import { LanguageToggle } from "@/features/convention/presentation/components/LanguageToggle";
import moonfestLogo from "@/shared/presentation/assets/moonfest-logo.svg";

interface TrackingConsentGateProps {
  readonly blockingEnabled?: boolean;
}

interface PreferenceTogglesProps {
  readonly categories: ConsentCategories;
  readonly onChange: (nextCategories: ConsentCategories) => void;
}

function PreferenceToggles({ categories, onChange }: PreferenceTogglesProps) {
  const { t } = useTranslation();

  const setCategory =
    (key: keyof Omit<ConsentCategories, "necessary">) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange({
        ...categories,
        [key]: event.target.checked,
      });
      trackContentInteraction({
        sectionId: "consent",
        contentId: `consent_${key}`,
        interactionType: event.target.checked ? "enable" : "disable",
      });
    };

  const rows: {
    id: keyof Omit<ConsentCategories, "necessary">;
    title: string;
    description: string;
  }[] = [
    {
      id: "analytics",
      title: t("convention.consent.categories.analytics.title"),
      description: t("convention.consent.categories.analytics.description"),
    },
  ];

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
      {rows.map((row) => (
        <label
          key={row.id}
          className="group flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-white/10 bg-surface/75 px-4 py-3 transition hover:border-accent/45 hover:bg-surface-elevated/90"
        >
          <span className="min-w-0">
            <span className="text-sm font-semibold text-foreground">
              {row.title}
            </span>
            <span className="mt-1 block text-xs text-muted-foreground">
              {row.description}
            </span>
          </span>
          <span className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-muted ring-1 ring-white/15 transition group-has-[:checked]:bg-accent">
            <input
              checked={categories[row.id]}
              className="peer sr-only"
              onChange={setCategory(row.id)}
              type="checkbox"
            />
            <span className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-background shadow transition peer-checked:translate-x-5" />
          </span>
        </label>
      ))}
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
          <div className="flex items-center justify-between gap-6 sm:block">
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
  const [isCustomizeOpen, setCustomizeOpen] = useState<boolean>(
    blockingEnabled && !initialValue
  );
  const [draftCategories, setDraftCategories] = useState<ConsentCategories>(
    initialValue?.categories ?? DEFAULT_CONSENT_CATEGORIES
  );

  useEffect(() => {
    setAnalyticsConsentGranted(Boolean(savedConsent?.categories.analytics));
  }, [savedConsent]);

  useEffect(() => {
    const shouldLockScroll =
      isCustomizeOpen || (blockingEnabled && !savedConsent);
    if (!shouldLockScroll) {
      return undefined;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [blockingEnabled, isCustomizeOpen, savedConsent]);

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
    setDraftCategories(savedValue.categories);
    setCustomizeOpen(false);
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

  const saveCustom = () => {
    persist(
      {
        analytics: draftCategories.analytics,
      },
      "customize"
    );
  };

  const openCustomization = () => {
    setDraftCategories(savedConsent?.categories ?? DEFAULT_CONSENT_CATEGORIES);
    setCustomizeOpen(true);
  };

  return {
    acceptAll,
    draftCategories,
    isCustomizeOpen,
    openCustomization,
    rejectOptional,
    saveCustom,
    savedConsent,
    setDraftCategories,
  };
}

export function TrackingConsentGate({
  blockingEnabled = true,
}: TrackingConsentGateProps) {
  const { t } = useTranslation();
  const {
    acceptAll,
    draftCategories,
    isCustomizeOpen,
    openCustomization,
    rejectOptional,
    saveCustom,
    setDraftCategories,
  } = useConsentState(blockingEnabled);

  if (!isCustomizeOpen) {
    return (
      <div className="pointer-events-none fixed right-3 bottom-3 z-40">
        <Button
          aria-label={t("convention.consent.manage")}
          className="pointer-events-auto size-11 border border-accent/60 bg-surface text-accent shadow-[0_0_16px_rgba(201,168,76,0.35)] hover:bg-accent hover:text-accent-foreground focus-visible:ring-accent/70"
          onClick={openCustomization}
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
            <PreferenceToggles
              categories={draftCategories}
              onChange={setDraftCategories}
            />
          </div>
        </div>
        <div className="border-t border-white/10 bg-surface/90 px-5 py-3 sm:px-6 sm:py-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              className="w-full border border-primary/95 bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--accent)))] py-6 text-base font-black uppercase tracking-[0.18em] text-primary-foreground shadow-[0_16px_40px_-20px_hsl(var(--accent))] hover:scale-[1.01] hover:brightness-110 focus-visible:ring-primary/90 sm:col-span-2"
              onClick={acceptAll}
              type="button"
              data-cta-id="consent_accept_all"
              data-content-id="consent_accept_all"
              data-content-section="consent"
            >
              {t("convention.consent.acceptAll")}
            </Button>
            <Button
              className="w-full border-white/15 bg-white/5 text-sm font-medium text-foreground/75 hover:bg-white/10 hover:text-foreground/85 focus-visible:ring-white/60"
              onClick={saveCustom}
              type="button"
              variant="outline"
              data-cta-id="consent_save"
              data-content-id="consent_save"
              data-content-section="consent"
            >
              {t("convention.consent.saveSelection")}
            </Button>
            <Button
              className="w-full border-white/10 bg-transparent text-sm font-medium text-foreground/60 hover:bg-white/5 hover:text-foreground/75 focus-visible:ring-white/50"
              onClick={rejectOptional}
              type="button"
              variant="outline"
              data-cta-id="consent_reject"
              data-content-id="consent_reject"
              data-content-section="consent"
            >
              {t("convention.consent.rejectOptional")}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
