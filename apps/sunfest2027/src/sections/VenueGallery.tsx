import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
import { tid } from "@/lib/tid";
import { useScrollReveal } from "@/lib/useScrollReveal";
import { VENUE_PHOTOS } from "@/venue";

/** The venue photos strung up as cream-framed carnaval flags on a garland. */
export function VenueGallery() {
  const { t } = useTranslation();
  const { ref, revealed } = useScrollReveal();
  return (
    <section
      ref={ref}
      className={cn("section", "section-venue", revealed && "is-revealed")}
      data-content-section="venue"
      data-testid={tid("venue")}
    >
      <p className="section-eyebrow">{t("venue.eyebrow")}</p>
      <h2 className="section-title">{t("venue.title")}</h2>
      <p className="section-body">{t("venue.subtitle")}</p>

      <ul className="flag-garland">
        {VENUE_PHOTOS.map((photo) => (
          <li key={photo.captionKey} className="flag">
            <figure className="flag-figure">
              <img
                src={photo.src}
                alt={t(photo.altKey)}
                loading="lazy"
                decoding="async"
              />
              <figcaption className="flag-caption">
                {t(photo.captionKey)}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
