import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FallingFlowers } from "@/components/FallingFlowers";
import { GarlandDivider } from "@/components/GarlandDivider";
import { LanguageToggle } from "@/components/LanguageToggle";
import { CtaBand } from "@/sections/CtaBand";
import { Hero } from "@/sections/Hero";
import { Highlights } from "@/sections/Highlights";
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
      <FallingFlowers />
      <div className="confetti" aria-hidden="true" />
      <div className="garland" aria-hidden="true" />

      <Hero />
      <GarlandDivider />
      <WhatIsSunfest />
      <GarlandDivider />
      <HotelShowcase />
      <GarlandDivider />
      <Highlights />
      <GarlandDivider />
      <CtaBand />
      <SiteFooter />
    </main>
  );
}
