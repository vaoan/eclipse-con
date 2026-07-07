import { useTranslation } from "react-i18next";
import { InfoCard } from "@/components/InfoCard";
import { SectionHeader } from "@/components/SectionHeader";
import { ACTIVITIES, SECTION_IDS } from "@/content";

/** "What you'll find" — a grid of activity cards. */
export function ActivitiesSection() {
  const { t } = useTranslation();
  return (
    <section id={SECTION_IDS.activities} className="section section-alt">
      <div className="container">
        <SectionHeader
          title={t("activities.title")}
          subtitle={t("activities.subtitle")}
        />
        <div className="card-grid">
          {ACTIVITIES.map((activity) => (
            <InfoCard
              key={activity.id}
              icon={activity.icon}
              title={t(`activities.${activity.id}.title`)}
              description={t(`activities.${activity.id}.description`)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
