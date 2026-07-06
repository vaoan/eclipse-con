export const VENUE_FEATURE_KEYS = [
  "convention.venue.feature1",
  "convention.venue.feature2",
  "convention.venue.feature3",
  "convention.venue.feature4",
  "convention.venue.feature5",
  "convention.venue.feature6",
  "convention.venue.feature7",
  "convention.venue.feature8",
  "convention.venue.feature9",
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

function isSpanishLanguage(language: string) {
  return language.startsWith("es");
}

function getTripadvisorUrl(language: string) {
  return isSpanishLanguage(language)
    ? TRIPADVISOR_URLS.es
    : TRIPADVISOR_URLS.en;
}

function getServicesUrl(language: string) {
  return isSpanishLanguage(language) ? SERVICES_URLS.es : SERVICES_URLS.en;
}

/** Builds the venue badge link set for the active language. */
export function getVenueBadges(language: string) {
  const tripadvisorUrl = getTripadvisorUrl(language);

  return [
    {
      key: "convention.venue.rating",
      href: tripadvisorUrl,
      icon: true,
    },
    {
      key: "convention.venue.award",
      href: tripadvisorUrl,
      icon: false,
    },
    {
      key: "convention.venue.certification",
      href: CERTIFICATIONS_URL,
      icon: false,
    },
  ] as const;
}

/** Builds the venue source link list for the active language. */
export function getVenueSources(language: string) {
  return [
    {
      key: "convention.venue.sourceTripadvisor",
      href: getTripadvisorUrl(language),
    },
    {
      key: "convention.venue.sourceServices",
      href: getServicesUrl(language),
    },
    {
      key: "convention.venue.sourceEvents",
      href: EVENTS_URL,
    },
    {
      key: "convention.venue.sourceClimate",
      href: CLIMATE_URL,
    },
    {
      key: "convention.venue.sourceCertifications",
      href: CERTIFICATIONS_URL,
    },
  ] as const;
}
