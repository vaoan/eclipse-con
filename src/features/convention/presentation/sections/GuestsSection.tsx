import { useTranslation } from "react-i18next";

import { SECTION_IDS } from "@/features/convention/domain/constants";
import { GUESTS } from "@/features/convention/application/data/guests";
import { GuestCard } from "../components/GuestCard";
import { SectionHeader } from "../components/SectionHeader";
import { SectionWrapper } from "../components/SectionWrapper";

export function GuestsSection() {
  const { t } = useTranslation();

  return (
    <SectionWrapper id={SECTION_IDS.GUESTS} surfaceTone="elevated">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionHeader
          title={t("convention.guests.title")}
          align="left"
          accent="gold"
        />
        <p className="max-w-md text-sm text-muted-foreground sm:text-base">
          {t("convention.guests.subtitle")}
        </p>
      </div>
      <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {GUESTS.map((guest) => (
          <GuestCard key={guest.id} guest={guest} />
        ))}
      </div>
    </SectionWrapper>
  );
}
