import { useTranslation } from "react-i18next";

import { SECTION_IDS } from "@/features/convention/domain/constants";
import { TICKET_TIERS } from "@/features/convention/application/data/ticketTiers";
import { SectionWrapper } from "../components/SectionWrapper";
import { TicketCard } from "../components/TicketCard";

export function RegistrationSection() {
  const { t } = useTranslation();

  return (
    <SectionWrapper id={SECTION_IDS.REGISTRATION} className="bg-surface">
      <div className="text-center">
        <h2 className="font-display text-4xl font-bold text-foreground md:text-5xl">
          {t("convention.registration.title")}
        </h2>
        <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-accent" />
        <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
          {t("convention.registration.subtitle")}
        </p>
      </div>
      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {TICKET_TIERS.map((tier) => (
          <TicketCard key={tier.id} tier={tier} />
        ))}
      </div>
    </SectionWrapper>
  );
}
