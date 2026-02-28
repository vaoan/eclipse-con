import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { Button } from "@/shared/presentation/ui/button";
import { SECTION_IDS } from "@/features/convention/domain/constants";
import { TICKET_TIERS } from "@/features/convention/application/data/ticketTiers";
import { SectionHeader } from "../components/SectionHeader";
import { SectionWrapper } from "../components/SectionWrapper";
import { TicketCard } from "../components/TicketCard";

/** Renders the Registration section with ticket tier cards and CTA links to the reservation flow. */
export function RegistrationSection() {
  const { t } = useTranslation();

  return (
    <SectionWrapper id={SECTION_IDS.REGISTRATION} surfaceTone="elevated">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionHeader
          title={t("convention.registration.title")}
          align="left"
          accent="gold"
        />
        <p className="max-w-md text-sm text-muted-foreground sm:text-base">
          {t("convention.registration.subtitle")}
        </p>
      </div>
      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {TICKET_TIERS.map((tier) => (
          <TicketCard key={tier.id} tier={tier} />
        ))}
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
        <Button
          asChild
          variant="secondary"
          className="border border-accent/60 bg-accent/15 text-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.06)] hover:-translate-y-0.5 hover:bg-accent/25 hover:shadow-[0_10px_30px_-16px_hsl(var(--accent))] focus-visible:ring-accent/60"
        >
          <Link
            to="/registration-tutorial"
            data-funnel-step="registration_tutorial"
            data-cta-id="registration_tutorial_open"
            data-cta-variant="section_guide"
            data-content-section="registration"
            data-content-id="registration_tutorial_link"
            data-content-interaction="open"
          >
            {t("convention.registration.tutorialLink")}
          </Link>
        </Button>
        <Button asChild variant="outline" className="border-white/10">
          <a
            href="https://moonfest-b63fa.web.app/page/moonfest/soon.html"
            target="_blank"
            rel="noreferrer"
            data-funnel-step="start_checkout"
            data-cta-id="registration_ticket_soon"
            data-cta-variant="section_secondary"
            data-content-section="registration"
            data-content-id="ticket_soon_link"
            data-content-interaction="open"
          >
            {t("convention.registration.ticketLink")}
          </a>
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        {t("convention.registration.devNote")}
      </p>
      <p className="text-sm text-muted-foreground">
        {t("convention.registration.noteServices")}
      </p>
      <p className="text-sm text-muted-foreground">
        {t("convention.registration.note")}
      </p>
    </div>
  );
}
