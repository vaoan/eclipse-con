import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

import { Check } from "lucide-react";

import { Button } from "@/shared/presentation/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/presentation/ui/card";
import {
  SECTION_IDS,
  RESERVATION_URL,
} from "@/features/convention/domain/constants";
import { tid } from "@/shared/application/utils/tid";
import { SectionHeader } from "../components/SectionHeader";
import { SectionWrapper } from "../components/SectionWrapper";

const PACKAGE_FEATURES = [
  "convention.registration.package.feature1",
  "convention.registration.package.feature2",
  "convention.registration.package.feature5",
] as const;

const PRICE_TIERS = [
  {
    nameKey: "convention.registration.quad.name",
    priceKey: "convention.registration.quad.price",
  },
  {
    nameKey: "convention.registration.trio.name",
    priceKey: "convention.registration.trio.price",
  },
  {
    nameKey: "convention.registration.soloDuo.name",
    priceKey: "convention.registration.soloDuo.price",
  },
] as const;

/** Renders the Registration section with a single consolidated pricing card and CTA links. */
export function RegistrationSection() {
  const { t } = useTranslation();

  return (
    <SectionWrapper id={SECTION_IDS.REGISTRATION} surfaceTone="elevated">
      <SectionHeader
        title={t("convention.registration.title")}
        align="left"
        accent="gold"
      />
      <div className="mt-12 flex justify-center">
        <Card
          className="w-full max-w-lg border-accent/50 bg-surface-elevated shadow-lg shadow-accent/10"
          {...tid("registration-card")}
        >
          <CardHeader className="gap-2">
            <CardTitle className="font-display text-xl font-bold text-foreground">
              {t("convention.registration.package.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ul className="space-y-3">
              {PACKAGE_FEATURES.map((key) => (
                <li
                  key={key}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <Check size={16} className="shrink-0 text-accent" />
                  <span>{t(key)}</span>
                </li>
              ))}
            </ul>
            <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 shadow-[inset_0_1px_0_0_rgba(224,117,58,0.1)]">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                {t("convention.registration.popular")}
              </p>
              <div className="space-y-3">
                {PRICE_TIERS.map(({ nameKey, priceKey }) => (
                  <div
                    key={nameKey}
                    className="flex items-center justify-between gap-4"
                  >
                    <span className="text-sm text-foreground/90">
                      {t(nameKey)}
                    </span>
                    <span className="font-display text-base font-bold text-accent drop-shadow-[0_0_6px_rgba(224,117,58,0.3)]">
                      {t(priceKey)}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-accent/75">
                {t("convention.registration.priceNote")}
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              asChild
              className="w-full bg-accent text-accent-foreground hover:bg-accent-glow"
            >
              <a
                href={RESERVATION_URL}
                target="_blank"
                rel="noreferrer"
                data-funnel-step="click_reserve"
                data-cta-id="registration_reserve"
                data-cta-variant="single_card"
                data-content-section="registration"
                data-content-id="registration_reserve"
                data-content-interaction="open"
              >
                {t("convention.registration.cta")}
              </a>
            </Button>
          </CardFooter>
        </Card>
      </div>
      <RegistrationCta t={t} />
    </SectionWrapper>
  );
}

function RegistrationCta({ t }: Readonly<{ t: TFunction }>) {
  return (
    <div className="mt-10 flex flex-col items-center gap-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
        {t("convention.registration.highlight")}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <span
          role="button"
          aria-disabled="true"
          tabIndex={0}
          className="inline-flex h-9 cursor-default items-center justify-center rounded-md border border-accent/60 bg-accent/15 px-4 py-2 text-sm font-medium text-foreground/50 opacity-70 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
          data-funnel-step="registration_tutorial"
          data-cta-id="registration_tutorial_interest"
          data-cta-variant="coming_soon"
          data-content-section="registration"
          data-content-id="registration_tutorial_link"
          data-content-interaction="interest"
        >
          {t("convention.registration.tutorialLink")}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        {t("convention.registration.noteServices")}
      </p>
      <p className="text-sm text-muted-foreground">
        {t("convention.registration.note")}
      </p>
    </div>
  );
}
