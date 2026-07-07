import { useTranslation } from "react-i18next";
import { SectionHeader } from "@/components/SectionHeader";
import { SECTION_IDS, VENUE_FEATURES } from "@/content";

const HOTEL_TEL = "tel:+573009124676";
const HOTEL_MAILTO = "mailto:reservas@hotelmocawaresort.com";

/** The hotel — Hotel Mocawa Resort: description, features, and contact. */
export function VenueSection() {
  const { t } = useTranslation();
  return (
    <section id={SECTION_IDS.venue} className="section">
      <div className="container">
        <SectionHeader title={t("venue.title")} />
        <div className="venue">
          <p className="venue-name">{t("venue.name")}</p>
          <p className="venue-loc">{t("venue.location")}</p>
          <p className="prose">{t("venue.description")}</p>
          <p className="prose">{t("venue.description2")}</p>
          <ul className="venue-features">
            {VENUE_FEATURES.map((feature) => (
              <li key={feature}>{t(`venue.features.${feature}`)}</li>
            ))}
          </ul>
          <div className="venue-contact">
            <span className="venue-contact-title">
              {t("venue.contactTitle")}
            </span>
            <a
              href={HOTEL_TEL}
              className="venue-link"
              data-content-section="venue"
              data-content-id="venue_phone"
            >
              {t("venue.phone")}
            </a>
            <a
              href={HOTEL_MAILTO}
              className="venue-link"
              data-content-section="venue"
              data-content-id="venue_email"
            >
              {t("venue.email")}
            </a>
            <span className="venue-rnt">{t("venue.rnt")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
