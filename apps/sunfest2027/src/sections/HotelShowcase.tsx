import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Lightbox } from "@/components/Lightbox";
import { ShowcaseCard } from "@/components/ShowcaseCard";
import { cn } from "@/lib/cn";
import { tid } from "@/lib/tid";
import { useScrollReveal } from "@/lib/useScrollReveal";
import { SHOWCASE_FEATURE, SHOWCASE_ITEMS, SHOWCASE_ROOMS } from "@/showcase";

const ROOMS_START = 1;

/**
 * "The resort", right after the hero: the giant pool as the money-shot feature,
 * then the room types. Any photo opens a full-screen lightbox.
 */
export function HotelShowcase() {
  const { t } = useTranslation();
  const { ref, revealed } = useScrollReveal();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      ref={ref}
      className={cn("section", "section-showcase", revealed && "is-revealed")}
      data-content-section="showcase"
      data-testid={tid("showcase")}
    >
      <p className="section-eyebrow">{t("showcase.eyebrow")}</p>
      <h2 className="section-title">{t("showcase.title")}</h2>
      <p className="section-body">{t("showcase.body")}</p>

      <button
        type="button"
        className="showcase-feature"
        onClick={() => {
          setOpenIndex(0);
        }}
        aria-label={t("showcase.openItem", {
          title: t(SHOWCASE_FEATURE.titleKey),
        })}
        data-testid={tid("showcase-feature")}
        data-content-section="showcase"
        data-content-id="open_giantPool"
        data-content-interaction="open"
      >
        <img
          src={SHOWCASE_FEATURE.src}
          alt=""
          className="showcase-feature-img"
          decoding="async"
        />
        <span className="showcase-feature-caption">
          <span className="showcase-feature-title">
            {t(SHOWCASE_FEATURE.titleKey)}
          </span>
          <span className="showcase-feature-blurb">
            {t(SHOWCASE_FEATURE.blurbKey)}
          </span>
        </span>
      </button>

      <h3 className="showcase-subheading">{t("showcase.roomsHeading")}</h3>
      <ul className="showcase-rooms">
        {SHOWCASE_ROOMS.map((room, index) => (
          <li key={room.id}>
            <ShowcaseCard
              item={room}
              tall
              onOpen={() => {
                setOpenIndex(ROOMS_START + index);
              }}
            />
          </li>
        ))}
      </ul>

      <Lightbox
        items={SHOWCASE_ITEMS}
        index={openIndex}
        onClose={() => {
          setOpenIndex(null);
        }}
        onNavigate={setOpenIndex}
      />
    </section>
  );
}
