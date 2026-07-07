import { useTranslation } from "react-i18next";
import { SectionHeader } from "@/components/SectionHeader";
import { SectionWrapper } from "@/components/SectionWrapper";
import { SECTION_IDS, VENUE_FEATURES } from "@/content";

const HOTEL_TEL = "tel:+573009124676";
const HOTEL_MAILTO = "mailto:reservas@hotelmocawaresort.com";
const VENUE_IMAGES = [
  "/assets/hotel/resort-1.webp",
  "/assets/hotel/resort-8.webp",
  "/assets/hotel/resort-11.webp",
] as const;

/** Hotel contact row: phone, email, and RNT registration number. */
function VenueContact() {
  const { t } = useTranslation();
  return (
    <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
      <span className="w-full text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {t("venue.contactTitle")}
      </span>
      <a
        href={HOTEL_TEL}
        className="font-medium text-accent underline decoration-dashed underline-offset-4 transition hover:text-accent-glow"
        data-content-section="venue"
        data-content-id="venue_phone"
      >
        {t("venue.phone")}
      </a>
      <a
        href={HOTEL_MAILTO}
        className="font-medium text-accent underline decoration-dashed underline-offset-4 transition hover:text-accent-glow"
        data-content-section="venue"
        data-content-id="venue_email"
      >
        {t("venue.email")}
      </a>
      <span className="text-muted-foreground">{t("venue.rnt")}</span>
    </div>
  );
}

/** The hotel — Hotel Mocawa Resort: details, features, contact, and photos. */
export function VenueSection() {
  const { t } = useTranslation();
  const venueName = t("venue.name");

  return (
    <SectionWrapper id={SECTION_IDS.venue} surfaceTone="deep">
      <div className="grid items-start gap-10 lg:grid-cols-[1.02fr_0.98fr]">
        <div>
          <SectionHeader
            title={t("venue.title")}
            eyebrow={t("groups.place")}
            align="left"
          />
          <h3 className="font-display mt-6 text-2xl font-bold text-accent">
            {venueName}
          </h3>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <span
              className="h-1.5 w-1.5 rounded-full bg-accent"
              aria-hidden="true"
            />
            {t("venue.location")}
          </p>
          <div className="mt-5 space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            <p>{t("venue.description")}</p>
            <p>{t("venue.description2")}</p>
          </div>
          <ul className="mt-6 grid gap-3 text-sm text-foreground/85 sm:grid-cols-2">
            {VENUE_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                  aria-hidden="true"
                />
                <span>{t(`venue.features.${feature}`)}</span>
              </li>
            ))}
          </ul>
          <VenueContact />
        </div>

        <div className="relative">
          <div
            className="absolute -left-6 top-8 h-44 w-44 rounded-full bg-primary/25 blur-3xl"
            aria-hidden="true"
          />
          <img
            src={VENUE_IMAGES[0]}
            alt={venueName}
            width={900}
            height={520}
            className="relative w-full rounded-2xl border border-white/10 object-cover shadow-xl"
            loading="lazy"
            decoding="async"
          />
          <div className="mt-4 grid grid-cols-2 gap-4">
            <img
              src={VENUE_IMAGES[1]}
              alt={venueName}
              width={440}
              height={300}
              className="h-full w-full rounded-2xl border border-white/10 object-cover shadow-xl"
              loading="lazy"
              decoding="async"
            />
            <img
              src={VENUE_IMAGES[2]}
              alt={venueName}
              width={440}
              height={300}
              className="h-full w-full rounded-2xl border border-white/10 object-cover shadow-xl"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
