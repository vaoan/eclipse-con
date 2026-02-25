import { useTranslation } from "react-i18next";
import {
  MapPin,
  CalendarDays,
  Trees,
  Sparkles,
  Utensils,
  Building2,
  PawPrint,
  Wifi,
  Bike,
  Globe,
} from "lucide-react";

import { SECTION_IDS } from "@/features/convention/domain/constants";
import { SectionWrapper } from "../components/SectionWrapper";

const VENUE_FEATURES = [
  { key: "convention.venue.feature1", icon: CalendarDays },
  { key: "convention.venue.feature2", icon: Sparkles },
  { key: "convention.venue.feature3", icon: Trees },
  { key: "convention.venue.feature4", icon: Utensils },
  { key: "convention.venue.feature5", icon: Building2 },
  { key: "convention.venue.feature6", icon: PawPrint },
  { key: "convention.venue.feature7", icon: Wifi },
  { key: "convention.venue.feature8", icon: Bike },
  { key: "convention.venue.feature9", icon: Globe },
] as const;

const TRIPADVISOR_URLS = {
  en: "https://www.tripadvisor.com/Hotel_Review-g312856-d603709-Reviews-Estelar_Paipa_Hotel_Convention_Center-Paipa_Boyaca_Department.html",
  es: "https://www.tripadvisor.es/Hotel_Review-g312856-d603709-Reviews-Estelar_Paipa_Hotel_Convention_Center-Paipa_Boyaca_Department.html",
} as const;

const SERVICES_URLS = {
  en: "https://www.estelarpaipa.com/en/services/",
  es: "https://www.estelarpaipa.com/es/servicios/",
} as const;

const EVENTS_URL = "https://www.estelarpaipa.com/eventos/";
const CLIMATE_URL =
  "https://www.weather-atlas.com/en/colombia/paipa-weather-july";
const CERTIFICATIONS_URL =
  "https://es.travel2latam.com/news-62140-hoteles-estelar-obtiene-sellos-safe-guard-y-check-in-certificado";

export function VenueSection() {
  const { t, i18n } = useTranslation();
  const isSpanish = i18n.language.startsWith("es");
  const tripadvisorUrl = isSpanish ? TRIPADVISOR_URLS.es : TRIPADVISOR_URLS.en;
  const servicesUrl = isSpanish ? SERVICES_URLS.es : SERVICES_URLS.en;
  const venueBadges = [
    { key: "convention.venue.rating", href: tripadvisorUrl, icon: true },
    { key: "convention.venue.award", href: tripadvisorUrl },
    { key: "convention.venue.certification", href: CERTIFICATIONS_URL },
  ] as const;
  const venueSources = [
    { key: "convention.venue.sourceTripadvisor", href: tripadvisorUrl },
    { key: "convention.venue.sourceServices", href: servicesUrl },
    { key: "convention.venue.sourceEvents", href: EVENTS_URL },
    { key: "convention.venue.sourceClimate", href: CLIMATE_URL },
    { key: "convention.venue.sourceCertifications", href: CERTIFICATIONS_URL },
  ] as const;

  return (
    <SectionWrapper id={SECTION_IDS.VENUE} surfaceTone="deep">
      <div className="grid items-start gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative">
          <div className="absolute -left-6 top-8 h-44 w-44 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-6 right-0 h-36 w-36 rounded-full bg-accent/10 blur-3xl" />
          <img
            src="https://www.estelarpaipa.com/media/uploads/cms/estelar-paipa-hotel-1_ps6qOHg.webp?q=pr%3Asharp%2Frs%3Afill%2Fmw%3A100%2Fh%3A500%2Fg%3Ace%2Ff%3Ajpg"
            alt={t("convention.venue.imageAlt")}
            className="relative w-full rounded-2xl border border-white/10 object-cover shadow-xl"
            loading="lazy"
          />
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-foreground/80">
            {venueBadges.map((badge) => (
              <a
                key={badge.key}
                href={badge.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-surface/40 px-3 py-1.5 transition hover:text-foreground"
              >
                {badge.icon && (
                  <img
                    src="https://cdn.simpleicons.org/tripadvisor/ffffff?viewbox=auto"
                    alt="Tripadvisor"
                    className="h-4 w-4"
                    loading="lazy"
                  />
                )}
                {t(badge.key)}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-display text-4xl font-bold text-foreground md:text-5xl">
            {t("convention.venue.title")}
          </h2>
          <div className="mt-4 h-1 w-16 rounded-full bg-accent" />
          <h3 className="font-display mt-6 text-2xl font-bold text-accent">
            {t("convention.venue.name")}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin size={14} className="text-primary" />
            {t("convention.venue.location")}
          </p>
          <div className="mt-5 space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            <p>{t("convention.venue.description")}</p>
            <p>{t("convention.venue.description2")}</p>
          </div>
          <ul className="mt-6 grid gap-3 text-sm text-foreground/85 sm:grid-cols-2">
            {VENUE_FEATURES.slice(0, 6).map(({ key, icon: Icon }) => (
              <li key={key} className="flex items-start gap-2">
                <Icon size={16} className="mt-0.5 text-accent" />
                <span>{t(key)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-foreground/70">
            <span className="uppercase tracking-wide text-foreground/50">
              {t("convention.venue.sourcesLabel")}
            </span>
            {venueSources.map((source) => (
              <a
                key={source.key}
                href={source.href}
                target="_blank"
                rel="noreferrer"
                className="underline decoration-dashed underline-offset-4 transition hover:text-foreground"
              >
                {t(source.key)}
              </a>
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
