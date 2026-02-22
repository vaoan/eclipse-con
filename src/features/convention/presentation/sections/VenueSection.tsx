import { useTranslation } from "react-i18next";
import { MapPin, Maximize2, Trees, Hotel, Accessibility } from "lucide-react";

import { SECTION_IDS } from "@/features/convention/domain/constants";
import { SectionWrapper } from "../components/SectionWrapper";
import { ToriiGateSilhouette } from "../components/ToriiGateSilhouette";

const VENUE_FEATURES = [
  { key: "convention.venue.feature1", icon: Maximize2 },
  { key: "convention.venue.feature2", icon: Trees },
  { key: "convention.venue.feature3", icon: Hotel },
  { key: "convention.venue.feature4", icon: Accessibility },
] as const;

export function VenueSection() {
  const { t } = useTranslation();

  return (
    <SectionWrapper id={SECTION_IDS.VENUE}>
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

        {/* Decorative torii + clouds */}
        <div
          className="relative flex items-center justify-center"
          aria-hidden="true"
        >
          <div className="absolute h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
          <ToriiGateSilhouette className="relative w-48 text-accent/20 md:w-64" />
          <div className="absolute -bottom-4 h-1 w-3/4 rounded-full bg-accent/10 blur-sm" />
        </div>
      </div>
    </SectionWrapper>
  );
}
