import { useTranslation } from "react-i18next";
import { MapPin, Maximize2, Trees, Hotel, Accessibility } from "lucide-react";

import { SECTION_IDS } from "@/features/convention/domain/constants";
import { SectionWrapper } from "../components/SectionWrapper";
import { VenueDecorations } from "../components/VenueDecorations";

const VENUE_FEATURES = [
  { key: "convention.venue.feature1", icon: Maximize2 },
  { key: "convention.venue.feature2", icon: Trees },
  { key: "convention.venue.feature3", icon: Hotel },
  { key: "convention.venue.feature4", icon: Accessibility },
] as const;

export function VenueSection() {
  const { t } = useTranslation();

  return (
    <SectionWrapper
      id={SECTION_IDS.VENUE}
      className="bg-surface"
      decorations={<VenueDecorations />}
    >
      <div className="grid items-center gap-12 md:grid-cols-2">
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
          <img
            src="https://www.estelarpaipa.com/uploads/cms/TC_transparent_BF_Logo_L_2025_RGB_1.png"
            alt={t("convention.venue.logoAlt")}
            className="mt-4 h-10 w-auto opacity-80"
            loading="lazy"
          />
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-surface/40 px-3 py-1.5 text-xs text-foreground/80">
            <img
              src="https://cdn.simpleicons.org/tripadvisor/ffffff?viewbox=auto"
              alt="Tripadvisor"
              className="h-4 w-4"
              loading="lazy"
            />
            Tripadvisor
          </div>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            {t("convention.venue.description")}
          </p>
          <ul className="mt-6 grid grid-cols-2 gap-3">
            {VENUE_FEATURES.map(({ key, icon: Icon }) => (
              <li
                key={key}
                className="flex items-center gap-2 text-sm text-foreground/80"
              >
                <Icon size={16} className="text-accent" />
                {t(key)}
              </li>
            ))}
          </ul>
        </div>

        {/* Hotel image */}
        <div
          className="relative flex items-center justify-center"
          aria-hidden="true"
        >
          <div className="absolute h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
          <img
            src="https://www.estelarpaipa.com/media/uploads/cms/estelar-paipa-hotel-1_ps6qOHg.webp?q=pr%3Asharp%2Frs%3Afill%2Fmw%3A100%2Fh%3A500%2Fg%3Ace%2Ff%3Ajpg"
            alt={t("convention.venue.imageAlt")}
            className="relative w-full max-w-sm rounded-2xl border border-white/10 object-cover shadow-xl"
            loading="lazy"
          />
          <div className="absolute -bottom-4 h-1 w-3/4 rounded-full bg-accent/10 blur-sm" />
        </div>
      </div>
    </SectionWrapper>
  );
}
