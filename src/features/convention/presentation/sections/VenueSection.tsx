import { useTranslation } from "react-i18next";
import { useState } from "react";
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

import { Badge } from "@/shared/presentation/ui/badge";
import { Button } from "@/shared/presentation/ui/button";
import { Card, CardContent } from "@/shared/presentation/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/presentation/ui/collapsible";
import { SECTION_IDS } from "@/features/convention/domain/constants";
import { SectionHeader } from "../components/SectionHeader";
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

/** Renders the Venue section with hotel details, feature list, badge links, and photos. */
// eslint-disable-next-line max-lines-per-function
export function VenueSection() {
  const { t, i18n } = useTranslation();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const isSpanish = i18n.language.startsWith("es");
  const tripadvisorUrl = isSpanish ? TRIPADVISOR_URLS.es : TRIPADVISOR_URLS.en;
  const servicesUrl = isSpanish ? SERVICES_URLS.es : SERVICES_URLS.en;
  const venueBadges: {
    key:
      | "convention.venue.rating"
      | "convention.venue.award"
      | "convention.venue.certification";
    href: string;
    icon?: boolean;
  }[] = [
    { key: "convention.venue.rating", href: tripadvisorUrl, icon: true },
    { key: "convention.venue.award", href: tripadvisorUrl },
    { key: "convention.venue.certification", href: CERTIFICATIONS_URL },
  ];
  const venueSources = [
    { key: "convention.venue.sourceTripadvisor", href: tripadvisorUrl },
    { key: "convention.venue.sourceServices", href: servicesUrl },
    { key: "convention.venue.sourceEvents", href: EVENTS_URL },
    { key: "convention.venue.sourceClimate", href: CLIMATE_URL },
    { key: "convention.venue.sourceCertifications", href: CERTIFICATIONS_URL },
  ] as const;

  const primaryFeatures = VENUE_FEATURES.slice(0, 6);
  const extraFeatures = VENUE_FEATURES.slice(6);

  return (
    <SectionWrapper id={SECTION_IDS.VENUE} surfaceTone="deep">
      <div className="grid items-start gap-10 lg:grid-cols-[1.02fr_0.98fr]">
        <div>
          <SectionHeader
            title={t("convention.venue.title")}
            align="left"
            accent="red"
          />
          <h3 className="font-display mt-6 text-2xl font-bold text-rose-300">
            {t("convention.venue.name")}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin size={14} className="text-rose-300" />
            {t("convention.venue.location")}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-foreground/80">
            {venueBadges.map((badge) => (
              <Badge
                key={badge.key}
                asChild
                variant="outline"
                className="w-full min-w-0 max-w-full items-start justify-start border-white/10 bg-surface/40 px-3 py-1.5 text-left text-[0.65rem] uppercase leading-snug tracking-[0.2em] text-foreground/80 whitespace-normal break-words hover:text-foreground sm:w-fit sm:items-center sm:justify-center sm:text-center sm:whitespace-nowrap"
              >
                <a
                  href={badge.href}
                  target="_blank"
                  rel="noreferrer"
                  data-content-section="venue"
                  data-content-id={badge.key.split(".").pop() ?? badge.key}
                >
                  {badge.icon && (
                    <img
                      src="https://cdn.simpleicons.org/tripadvisor/f43f5e?viewbox=auto"
                      alt="Tripadvisor"
                      className="h-4 w-4"
                      loading="lazy"
                    />
                  )}
                  {t(badge.key)}
                </a>
              </Badge>
            ))}
          </div>
          <div className="mt-5 space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            <p>{t("convention.venue.description")}</p>
            <p>{t("convention.venue.description2")}</p>
          </div>
          <ul className="mt-6 grid gap-3 text-sm text-foreground/85 sm:grid-cols-2">
            {primaryFeatures.map(({ key, icon: Icon }) => (
              <li key={key} className="flex items-start gap-2">
                <Icon size={16} className="mt-0.5 text-rose-300" />
                <span>{t(key)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="absolute -left-6 top-8 h-44 w-44 rounded-full bg-primary/10 blur-3xl" />
          <img
            src="https://www.estelarpaipa.com/media/uploads/cms/estelar-paipa-hotel-1_ps6qOHg.webp?q=pr%3Asharp%2Frs%3Afill%2Fmw%3A100%2Fh%3A500%2Fg%3Ace%2Ff%3Ajpg"
            alt={t("convention.venue.imageAlt")}
            className="relative w-full rounded-2xl border border-white/10 object-cover shadow-xl"
            loading="lazy"
          />
          <img
            src="https://www.estelarpaipa.com/media/uploads/galeriahoteles/estelar-paipa-piscinac.webp?q=pr%3Asharp%2Frs%3Afill%2Fw%3A900%2Fh%3A540%2Ff%3Ajpg"
            alt={t("convention.venue.imageAltSecondary")}
            className="mt-4 w-full rounded-2xl border border-white/10 object-cover shadow-xl"
            loading="lazy"
          />
          <Card className="mt-6 border-white/10 bg-surface/30">
            <CardContent className="p-4">
              <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    className="group flex w-full items-center justify-between px-0 text-left text-sm font-semibold text-foreground/90 transition hover:bg-transparent hover:text-rose-300"
                    data-content-section="venue"
                    data-content-id="venue_details"
                    data-content-interaction={
                      isDetailsOpen ? "collapse" : "expand"
                    }
                  >
                    <span className="inline-flex items-center gap-2">
                      <span className="text-foreground/70 transition group-hover:text-rose-300">
                        +
                      </span>
                      {t("convention.venue.detailsLabel")}
                    </span>
                    <span
                      className={`text-xs text-foreground/60 transition ${
                        isDetailsOpen ? "rotate-180" : ""
                      }`}
                    >
                      v
                    </span>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <p>{t("convention.venue.description3")}</p>
                  <ul className="grid gap-3 text-foreground/85 sm:grid-cols-2">
                    {extraFeatures.map(({ key, icon: Icon }) => (
                      <li key={key} className="flex items-start gap-2">
                        <Icon size={16} className="mt-0.5 text-rose-300" />
                        <span>{t(key)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-foreground/70">
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
                        data-content-section="venue"
                        data-content-id={
                          source.key.split(".").pop() ?? source.key
                        }
                      >
                        {t(source.key)}
                      </a>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
        </div>
      </div>
    </SectionWrapper>
  );
}
