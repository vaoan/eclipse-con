import { useTranslation } from "react-i18next";
import { InfoCard } from "@/components/InfoCard";
import { SectionHeader } from "@/components/SectionHeader";
import { SECTION_IDS, TRAVEL_TIPS } from "@/content";

/** Getting there — travel tips for reaching the coffee region. */
export function TravelSection() {
  const { t } = useTranslation();
  return (
    <section id={SECTION_IDS.travel} className="section">
      <div className="container">
        <SectionHeader
          title={t("travel.title")}
          subtitle={t("travel.subtitle")}
        />
        <div className="card-grid">
          {TRAVEL_TIPS.map((tip) => (
            <InfoCard
              key={tip.id}
              icon={tip.icon}
              title={t(`travel.${tip.id}.title`)}
              description={t(`travel.${tip.id}.description`)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
