import { useTranslation } from "react-i18next";

import { SECTION_IDS } from "@/features/convention/domain/constants";
import { GUESTS } from "@/features/convention/application/data/guests";
import { SectionWrapper } from "../components/SectionWrapper";
import { GuestCard } from "../components/GuestCard";

export function GuestsSection() {
  const { t } = useTranslation();

  return (
    <SectionWrapper id={SECTION_IDS.GUESTS} className="bg-surface">
      <div className="text-center">
        <h2 className="font-display text-4xl font-bold text-foreground md:text-5xl">
          {t("convention.guests.title")}
        </h2>
        <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-accent" />
        <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
          {t("convention.guests.subtitle")}
        </p>
      </div>
      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {GUESTS.map((guest) => (
          <GuestCard key={guest.id} guest={guest} />
        ))}
      </div>
    </SectionWrapper>
  );
}
