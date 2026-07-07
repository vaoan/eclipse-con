import { useTranslation } from "react-i18next";
import { SectionHeader } from "@/components/SectionHeader";
import { SectionWrapper } from "@/components/SectionWrapper";
import { SECTION_IDS, TRAVEL_TIPS } from "@/content";

/** Getting there — travel tips for reaching the coffee region, as a card grid. */
export function TravelSection() {
  const { t } = useTranslation();

  return (
    <SectionWrapper id={SECTION_IDS.travel} surfaceTone="deep">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionHeader
          title={t("travel.title")}
          eyebrow={t("groups.place")}
          align="left"
        />
        <p className="max-w-md text-sm text-muted-foreground sm:text-base">
          {t("travel.subtitle")}
        </p>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {TRAVEL_TIPS.map((tip) => (
          <article
            key={tip}
            className="rounded-2xl border border-white/10 bg-surface/70 p-5 transition-colors duration-300 hover:border-accent/30"
            data-content-section="travel"
            data-content-id={`travel_${tip}`}
          >
            <p className="font-display text-base font-semibold text-foreground">
              {t(`travel.${tip}.title`)}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t(`travel.${tip}.description`)}
            </p>
          </article>
        ))}
      </div>
    </SectionWrapper>
  );
}
