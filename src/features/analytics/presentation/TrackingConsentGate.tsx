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
import { setAnalyticsConsentGranted } from "@/features/analytics/infrastructure/extremeTracking";

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

function ConsentSupportPanel() {
  const { t } = useTranslation();

  return (
    <aside className="rounded-2xl border border-accent/35 bg-gradient-to-br from-accent/20 via-accent/10 to-transparent p-4 sm:p-5">
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-accent">
        {t("convention.consent.supportTag")}
      </p>
      <h3 className="mt-2 text-lg font-black text-foreground">
        {t("convention.consent.supportTitle")}
      </h3>
      <p className="mt-2 text-sm text-foreground/85">
        {t("convention.consent.description")}
      </p>
      <ul className="mt-4 space-y-2 text-xs text-foreground/80 sm:text-sm">
        <li>- {t("convention.consent.supportPoint1")}</li>
        <li>- {t("convention.consent.supportPoint2")}</li>
        <li>- {t("convention.consent.supportPoint3")}</li>
      </ul>
    </aside>
  );
}

function ConsentLanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const isEnglish = i18n.resolvedLanguage?.startsWith("en") ?? true;
  const activeLanguageLabel = isEnglish ? "English" : "Español";
  const currentLanguageId = "consent-language-toggle-current";

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={() => {
        void i18n.changeLanguage(isEnglish ? "es" : "en");
      }}
      className="group relative inline-flex h-9 min-w-[118px] items-center overflow-hidden rounded-full border border-accent/45 p-1 bg-background/60 hover:border-accent/70 focus-visible:ring-accent/70"
      role="switch"
      aria-checked={isEnglish}
      aria-describedby={currentLanguageId}
      aria-label={t("convention.language.toggleAria", {
        language: activeLanguageLabel,
      })}
    >
      <span className="pointer-events-none absolute inset-y-1 left-1 right-1 z-0">
        <span
          className={`block h-full w-1/2 rounded-full border border-accent/30 bg-accent shadow-[0_0_10px_rgba(201,168,76,0.3)] transition-transform duration-300 ${isEnglish ? "translate-x-0" : "translate-x-full"}`}
        />
      </span>
      <span className="relative z-10 grid w-full grid-cols-2 text-[11px] font-semibold">
        <span
          className={`flex h-7 items-center justify-center transition-colors ${isEnglish ? "text-accent-foreground" : "text-foreground/65"}`}
        >
          EN
        </span>
        <span
          className={`flex h-7 items-center justify-center transition-colors ${!isEnglish ? "text-accent-foreground" : "text-foreground/65"}`}
        >
          ES
        </span>
      </span>
      <span id={currentLanguageId} className="sr-only">
        {t("convention.language.current", { language: activeLanguageLabel })}
      </span>
    </Button>
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
          className="pointer-events-auto size-11 border border-accent/60 bg-surface text-accent shadow-[0_0_16px_rgba(201,168,76,0.35)] hover:bg-accent hover:text-accent-foreground focus-visible:ring-accent/70"
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
      <section className="relative z-10 flex max-h-[min(94vh,820px)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-accent/35 bg-surface/95 shadow-[0_0_40px_rgba(201,168,76,0.25)]">
        <div className="border-b border-accent/25 bg-gradient-to-r from-primary/35 via-surface-elevated to-accent/25 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <p className="pt-1 text-[0.65rem] font-bold uppercase tracking-[0.35em] text-accent">
              {t("convention.consent.title")}
            </p>
            <ConsentLanguageSwitcher />
          </div>
          <h2 className="mt-2 text-xl font-black text-foreground sm:text-2xl">
            {t("convention.consent.headline")}
          </h2>
        </div>

        <div className="grid flex-1 gap-4 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5 lg:grid-cols-[0.95fr_1.05fr]">
          <ConsentSupportPanel />
          <div>
            <PreferenceToggles
              categories={draftCategories}
              onChange={setDraftCategories}
            />
            <p className="mt-4 text-xs uppercase tracking-[0.16em] text-muted-foreground">
              {t("convention.consent.notice")}
            </p>
            <p className="mt-2 text-xs text-foreground/70">
              {t("convention.consent.scopeNote")}
            </p>
          </div>
        </div>
        <div className="border-t border-white/10 bg-surface/90 px-5 py-3 sm:px-6 sm:py-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              className="w-full border border-primary/95 bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--accent)))] py-6 text-base font-black uppercase tracking-[0.18em] text-primary-foreground shadow-[0_16px_40px_-20px_hsl(var(--accent))] hover:scale-[1.01] hover:brightness-110 focus-visible:ring-primary/90 sm:col-span-2"
              onClick={acceptAll}
              type="button"
            >
              {t("convention.consent.acceptAll")}
            </Button>
            <Button
              className="w-full border-white/15 bg-white/5 text-sm font-medium text-foreground/75 hover:bg-white/10 hover:text-foreground/85 focus-visible:ring-white/60"
              onClick={saveCustom}
              type="button"
              variant="outline"
            >
              {t("convention.consent.saveSelection")}
            </Button>
            <Button
              className="w-full border-white/10 bg-transparent text-sm font-medium text-foreground/60 hover:bg-white/5 hover:text-foreground/75 focus-visible:ring-white/50"
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
