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
} from "@/shared/infrastructure/analytics/consent";
import { setAnalyticsConsentGranted } from "@/shared/infrastructure/analytics/extremeTracking";

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
    {
      id: "personalization",
      title: t("convention.consent.categories.personalization.title"),
      description: t(
        "convention.consent.categories.personalization.description"
      ),
    },
    {
      id: "advertising",
      title: t("convention.consent.categories.advertising.title"),
      description: t("convention.consent.categories.advertising.description"),
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

function useConsentState() {
  const initialValue = useMemo(() => getStoredTrackingConsent(), []);
  const [savedConsent, setSavedConsent] = useState<TrackingConsentState | null>(
    initialValue
  );
  const [isCustomizeOpen, setCustomizeOpen] = useState<boolean>(!initialValue);
  const [draftCategories, setDraftCategories] = useState<ConsentCategories>(
    initialValue?.categories ?? DEFAULT_CONSENT_CATEGORIES
  );

  useEffect(() => {
    setAnalyticsConsentGranted(Boolean(savedConsent?.categories.analytics));
  }, [savedConsent]);

  useEffect(() => {
    if (!savedConsent || isCustomizeOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }

    return undefined;
  }, [isCustomizeOpen, savedConsent]);

  const persist = (
    categories: Omit<ConsentCategories, "necessary">,
    source: TrackingConsentState["source"]
  ) => {
    const savedValue = saveTrackingConsent(categories, source);
    setSavedConsent(savedValue);
    setDraftCategories(savedValue.categories);
    setCustomizeOpen(false);
  };

  const acceptAll = () => {
    persist(
      {
        analytics: true,
        personalization: true,
        advertising: true,
      },
      "accept_all"
    );
  };

  const rejectOptional = () => {
    persist(
      {
        analytics: false,
        personalization: false,
        advertising: false,
      },
      "reject_optional"
    );
  };

  const saveCustom = () => {
    persist(
      {
        analytics: draftCategories.analytics,
        personalization: draftCategories.personalization,
        advertising: draftCategories.advertising,
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

export function TrackingConsentGate() {
  const { t } = useTranslation();
  const {
    acceptAll,
    draftCategories,
    isCustomizeOpen,
    openCustomization,
    rejectOptional,
    saveCustom,
    savedConsent,
    setDraftCategories,
  } = useConsentState();

  if (!isCustomizeOpen && savedConsent) {
    return (
      <div className="pointer-events-none fixed right-3 bottom-3 z-40">
        <Button
          aria-label={t("convention.consent.manage")}
          className="pointer-events-auto size-11 border border-accent/40 bg-surface/90 text-accent shadow-[0_0_16px_rgba(201,168,76,0.35)] hover:bg-accent hover:text-accent-foreground"
          onClick={openCustomization}
          size="icon"
          type="button"
          variant="outline"
        >
          <ShieldCheck className="size-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[210] flex items-end justify-center bg-black/80 p-3 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(201,168,76,0.2),transparent_45%),linear-gradient(180deg,rgba(10,11,26,0.75),rgba(10,11,26,0.95))]" />
      <section className="relative z-10 w-full max-w-3xl overflow-hidden rounded-2xl border border-accent/35 bg-surface/95 shadow-[0_0_40px_rgba(201,168,76,0.25)]">
        <div className="border-b border-accent/25 bg-gradient-to-r from-primary/35 via-surface-elevated to-accent/25 px-5 py-4">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.35em] text-accent">
            {t("convention.consent.title")}
          </p>
          <h2 className="mt-2 text-xl font-black text-foreground sm:text-2xl">
            {t("convention.consent.headline")}
          </h2>
          <p className="mt-2 text-sm text-foreground/85">
            {t("convention.consent.description")}
          </p>
        </div>

        <div className="px-5 py-4 sm:px-6 sm:py-5">
          <PreferenceToggles
            categories={draftCategories}
            onChange={setDraftCategories}
          />
          <p className="mt-4 text-xs uppercase tracking-[0.16em] text-muted-foreground">
            {t("convention.consent.notice")}
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Button
              className="w-full bg-primary font-black uppercase tracking-[0.2em] text-primary-foreground hover:bg-primary/90"
              onClick={acceptAll}
              type="button"
            >
              {t("convention.consent.acceptAll")}
            </Button>
            <Button
              className="w-full border-accent/35 bg-surface-elevated text-foreground hover:bg-surface"
              onClick={saveCustom}
              type="button"
              variant="outline"
            >
              {t("convention.consent.saveSelection")}
            </Button>
            <Button
              className="w-full border-white/15 bg-transparent text-muted-foreground hover:bg-surface"
              onClick={rejectOptional}
              type="button"
              variant="outline"
            >
              {t("convention.consent.rejectOptional")}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
