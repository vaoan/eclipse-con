import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

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
      <div className="flex flex-wrap items-center justify-center gap-4">
        <a
          href={RESERVATION_URL}
          className="inline-flex items-center justify-center rounded-lg bg-accent px-6 py-3 text-sm font-bold text-accent-foreground transition-colors hover:bg-accent-glow"
          target="_blank"
          rel="noreferrer"
        >
          {t("convention.registration.reserveLink")}
        </a>
        <a
          href="https://moonfest-b63fa.web.app/page/moonfest/soon.html"
          className="inline-flex items-center justify-center rounded-lg border border-white/10 px-6 py-3 text-sm font-bold text-foreground transition-colors hover:border-accent/40 hover:text-accent"
          target="_blank"
          rel="noreferrer"
        >
          {t("convention.registration.ticketLink")}
        </a>
      </div>
      <p className="text-sm text-muted-foreground">
        {t("convention.registration.devNote")}
      </p>
      <p className="text-sm text-muted-foreground">
        {t("convention.registration.note")}
      </p>
    </div>
  );
}
