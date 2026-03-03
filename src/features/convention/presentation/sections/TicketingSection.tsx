import { useTranslation } from "react-i18next";

import { Button } from "@/shared/presentation/ui/button";
import { SECTION_IDS } from "@/features/convention/domain/constants";
import { tid } from "@/shared/application/utils/tid";
import { SectionHeader } from "../components/SectionHeader";
import { SectionWrapper } from "../components/SectionWrapper";

/** Renders the Ticketing section with an upcoming CTA button and a description of what the ticket includes. */
export function TicketingSection() {
  const { t } = useTranslation();

  return (
    <SectionWrapper id={SECTION_IDS.TICKETING} surfaceTone="elevated">
      <SectionHeader
        title={t("convention.ticketing.title")}
        align="center"
        accent="gold"
      />
      <div className="mx-auto mt-10 max-w-2xl text-center">
        <p className="text-base text-muted-foreground sm:text-lg">
          {t("convention.ticketing.description")}
        </p>
        <Button
          disabled
          size="lg"
          className="mt-8 h-auto cursor-not-allowed rounded-full bg-gradient-to-r from-accent via-primary to-primary px-10 py-3.5 text-base font-bold text-white opacity-60"
          {...tid("ticketing-cta")}
        >
          {t("convention.ticketing.cta")}
        </Button>
      </div>
    </SectionWrapper>
  );
}
