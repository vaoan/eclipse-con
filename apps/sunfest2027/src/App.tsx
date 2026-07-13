import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FallingFlowers } from "@/components/FallingFlowers";
import { FlowerToggle } from "@/components/FlowerToggle";
import { GarlandDivider } from "@/components/GarlandDivider";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Amenities } from "@/sections/Amenities";
import { CtaBand } from "@/sections/CtaBand";
import { Hero } from "@/sections/Hero";
import { HotelShowcase } from "@/sections/HotelShowcase";
import { SiteFooter } from "@/sections/SiteFooter";
import { WhatIsSunfest } from "@/sections/WhatIsSunfest";
import { tid } from "@/lib/tid";

/** Sunfest 2027 commercial teaser: a scrollable coffee-carnaval over the Quindío valley. */
export function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <main className="stage" data-testid={tid("teaser-root")}>
      <LanguageToggle />
      <FlowerToggle />
      <FallingFlowers />
      <div className="confetti" aria-hidden="true" />
      <div className="garland" aria-hidden="true" />

      <Hero />
      <GarlandDivider />
      <HotelShowcase />
      <GarlandDivider />
      <WhatIsSunfest />
      <GarlandDivider />
      <Amenities />
      <GarlandDivider />
      <CtaBand />
      <SiteFooter />
    </main>
  );
}
