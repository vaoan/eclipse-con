import { useTranslation } from "react-i18next";

import { SECTION_IDS } from "@/features/convention/domain/constants";
import { EVENTS } from "@/features/convention/application/data/events";
import { EventCard } from "../components/EventCard";
import { SectionWrapper } from "../components/SectionWrapper";

export function EventsSection() {
  const { t } = useTranslation();

  return (
    <SectionWrapper id={SECTION_IDS.EVENTS} surfaceTone="elevated">
      <div className="text-center">
        <h2 className="font-display text-4xl font-bold text-foreground md:text-5xl">
          {t("convention.events.title")}
        </h2>
        <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-accent" />
        <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
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
