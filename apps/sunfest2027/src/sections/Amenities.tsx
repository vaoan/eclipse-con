import { useState } from "react";
import { useTranslation } from "@/i18n";
import { AmenityCard } from "@/components/AmenityCard";
import { Lightbox } from "@/components/Lightbox";
import { cn } from "@/lib/cn";
import { tid } from "@/lib/tid";
import { useScrollReveal } from "@/lib/useScrollReveal";
import { AMENITIES, AMENITY_LIST } from "@/showcase";

/**
 * "What you'll find" — the venue amenities, each a photo + icon + label +
 * description card that opens the shared lightbox.
 */
export function Amenities() {
  const { t } = useTranslation();
  const { ref, revealed } = useScrollReveal();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      ref={ref}
      className={cn("section", "section-amenities", revealed && "is-revealed")}
      data-content-section="amenities"
      data-testid={tid("amenities")}
    >
      <p className="section-eyebrow">{t("amenities.eyebrow")}</p>
      <h2 className="section-title">{t("amenities.title")}</h2>

      <ul className="amenities-grid">
        {AMENITIES.map((item, index) => (
          <li key={item.id}>
            <AmenityCard
              item={item}
              onOpen={() => {
                setOpenIndex(index);
              }}
            />
          </li>
        ))}
      </ul>

      <h3 className="showcase-subheading">{t("amenities.moreHeading")}</h3>
      <ul className="amenity-list">
        {AMENITY_LIST.map(({ id, icon: Icon, labelKey }) => (
          <li key={id}>
            <Icon className="amenity-list-icon" aria-hidden="true" />
            <span>{t(labelKey)}</span>
          </li>
        ))}
      </ul>

      <Lightbox
        items={AMENITIES}
        index={openIndex}
        onClose={() => {
          setOpenIndex(null);
        }}
        onNavigate={setOpenIndex}
      />
    </section>
  );
}
