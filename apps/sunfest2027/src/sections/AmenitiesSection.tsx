import { useTranslation } from "react-i18next";
import { SectionHeader } from "@/components/SectionHeader";
import { AMENITIES, SECTION_IDS } from "@/content";

/** Facilities — the Hotel Mocawa Resort amenities grid. */
export function AmenitiesSection() {
  const { t } = useTranslation();
  return (
    <section id={SECTION_IDS.amenities} className="section section-alt">
      <div className="container">
        <SectionHeader
          title={t("amenities.title")}
          subtitle={t("amenities.subtitle")}
        />
        <ul className="amenity-grid">
          {AMENITIES.map((amenity) => (
            <li key={amenity.id} className="amenity">
              <span className="amenity-icon" aria-hidden="true">
                {amenity.icon}
              </span>
              <span>{t(`amenities.items.${amenity.id}`)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
