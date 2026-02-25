import { useTranslation } from "react-i18next";

import { SECTION_IDS } from "@/features/convention/domain/constants";
import { EVENTS } from "@/features/convention/application/data/events";
import { EventCard } from "../components/EventCard";
import { SectionHeader } from "../components/SectionHeader";
import { SectionWrapper } from "../components/SectionWrapper";

export function EventsSection() {
  const { t } = useTranslation();

  return (
    <SectionWrapper id={SECTION_IDS.EVENTS} surfaceTone="elevated">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionHeader title={t("convention.events.title")} align="left" />
        <p className="max-w-md text-sm text-muted-foreground sm:text-base">
          {t("convention.events.subtitle")}
        </p>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {EVENTS.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </SectionWrapper>
  );
}
