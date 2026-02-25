import { tid } from "@/shared/application/utils/tid";
import { Suspense, lazy, useEffect, useState } from "react";

import { NavigationBar } from "./components/NavigationBar";
import { SakuraParticles } from "./components/SakuraParticles";
import { HeroCanvasSky } from "./components/HeroCanvasSky";
import { HeroSection } from "./sections/HeroSection";
import { FooterSection } from "./sections/FooterSection";

const AboutSection = lazy(async () => ({
  default: (await import("./sections/AboutSection")).AboutSection,
}));
const EventsSection = lazy(async () => ({
  default: (await import("./sections/EventsSection")).EventsSection,
}));
const VenueSection = lazy(async () => ({
  default: (await import("./sections/VenueSection")).VenueSection,
}));
const RegistrationSection = lazy(async () => ({
  default: (await import("./sections/RegistrationSection")).RegistrationSection,
}));
const FaqSection = lazy(async () => ({
  default: (await import("./sections/FaqSection")).FaqSection,
}));
const NewsSection = lazy(async () => ({
  default: (await import("./sections/NewsSection")).NewsSection,
}));
const GuestsSection = lazy(async () => ({
  default: (await import("./sections/GuestsSection")).GuestsSection,
}));

export function Component() {
  const [effectsReady, setEffectsReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const handle = window.setTimeout(() => {
      setEffectsReady(true);
    }, 600);
    return () => {
      window.clearTimeout(handle);
    };
  }, []);

  return (
    <div className="relative isolate" {...tid("convention-page")}>
      {effectsReady && <HeroCanvasSky fixed className="z-0" />}
      <div className="relative z-10">
        <NavigationBar />
        {effectsReady && <SakuraParticles />}
        <div className="hero-sticky">
          <HeroSection />
        </div>
        <Suspense
          fallback={<div className="px-4 py-20 md:py-28" aria-busy="true" />}
        >
          <AboutSection />
          <EventsSection />
          <VenueSection />
          <RegistrationSection />
          <FaqSection />
          <NewsSection />
          <GuestsSection />
        </Suspense>
        <FooterSection />
      </div>
    </div>
  );
}
