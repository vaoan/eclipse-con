import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AmenityCard } from "@/components/AmenityCard";
import { Lightbox } from "@/components/Lightbox";
import { cn } from "@/lib/cn";
import { tid } from "@/lib/tid";
import { useScrollReveal } from "@/lib/useScrollReveal";
import { AMENITIES } from "@/showcase";

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
