import { useTranslation } from "react-i18next";

import { SECTION_IDS } from "@/features/convention/domain/constants";
import { GUESTS } from "@/features/convention/application/data/guests";
import { GuestCard } from "../components/GuestCard";
import { SectionHeader } from "../components/SectionHeader";
import { SectionWrapper } from "../components/SectionWrapper";

/** Renders the Guests section displaying a grid of featured guest speaker/organizer cards. */
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
      <div className="-mx-4 mt-12 flex flex-wrap justify-center">
        {GUESTS.map((guest) => (
          <div
            key={guest.id}
            className="flex w-full flex-col px-4 pb-8 sm:w-1/2 xl:w-1/3"
          >
            <GuestCard guest={guest} />
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
