import { useTranslation } from "react-i18next";
import { SectionHeader } from "@/components/SectionHeader";
import { SectionWrapper } from "@/components/SectionWrapper";
import { AMENITIES, SECTION_IDS } from "@/content";

/** Facilities — the Hotel Mocawa Resort amenities as a card grid. */
export function AmenitiesSection() {
  const { t } = useTranslation();

  return (
    <SectionWrapper id={SECTION_IDS.amenities} surfaceTone="elevated">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionHeader
          title={t("amenities.title")}
          eyebrow={t("groups.place")}
          align="left"
        />
        <p className="max-w-md text-sm text-muted-foreground sm:text-base">
          {t("amenities.subtitle")}
        </p>
      </div>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {AMENITIES.map((id) => (
          <li
            key={id}
            className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-surface p-4 text-sm text-foreground/85 transition-all duration-300 hover:border-accent/30 hover:bg-surface-elevated"
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/15 transition-colors group-hover:bg-accent/25"
              aria-hidden="true"
            >
              <span className="h-2 w-2 rounded-full bg-accent" />
            </span>
            <span>{t(`amenities.items.${id}`)}</span>
          </li>
        ))}
      </ul>
    </SectionWrapper>
  );
}
