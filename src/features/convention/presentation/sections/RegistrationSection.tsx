import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  RESERVATION_URL,
  SECTION_IDS,
} from "@/features/convention/domain/constants";
import { TICKET_TIERS } from "@/features/convention/application/data/ticketTiers";
import { SectionHeader } from "../components/SectionHeader";
import { SectionWrapper } from "../components/SectionWrapper";
import { TicketCard } from "../components/TicketCard";

export function RegistrationSection() {
  const { t } = useTranslation();

  return (
    <SectionWrapper id={SECTION_IDS.REGISTRATION} surfaceTone="elevated">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionHeader
          title={t("convention.registration.title")}
          align="left"
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
          className="bg-accent text-accent-foreground hover:bg-accent-glow"
        >
          <a href={RESERVATION_URL} target="_blank" rel="noreferrer">
            {t("convention.registration.reserveLink")}
          </a>
        </Button>
        <Button asChild variant="outline" className="border-white/10">
          <a
            href="https://moonfest-b63fa.web.app/page/moonfest/soon.html"
            target="_blank"
            rel="noreferrer"
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
