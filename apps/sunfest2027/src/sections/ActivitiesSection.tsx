import { useTranslation } from "react-i18next";
import { ActivityCard } from "@/components/ActivityCard";
import { SectionHeader } from "@/components/SectionHeader";
import { SectionWrapper } from "@/components/SectionWrapper";
import { ACTIVITIES, SECTION_IDS } from "@/content";

/** "What you'll find" — a card grid of the convention's activities. */
export function ActivitiesSection() {
  const { t } = useTranslation();

  return (
    <SectionWrapper id={SECTION_IDS.activities} surfaceTone="elevated">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionHeader
          title={t("activities.title")}
          eyebrow={t("groups.event")}
          align="left"
        />
        <p className="max-w-md text-sm text-muted-foreground sm:text-base">
          {t("activities.subtitle")}
        </p>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {ACTIVITIES.map((id) => (
          <ActivityCard
            key={id}
            id={id}
            title={t(`activities.${id}.title`)}
            description={t(`activities.${id}.description`)}
          />
        ))}
      </div>
    </SectionWrapper>
  );
}
