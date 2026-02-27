import { tid } from "@/shared/application/utils/tid";
import { SECTION_IDS } from "@/features/convention/domain/constants";
import { Suspense, lazy, useEffect, useState } from "react";

import { NavigationBar } from "./components/NavigationBar";
import { SakuraParticles } from "./components/SakuraParticles";
import { HeroCanvasSky } from "./components/HeroCanvasSky";
import { HeroSection } from "./sections/HeroSection";
import { FooterSection } from "./sections/FooterSection";
import { EventOverviewSection } from "./sections/EventOverviewSection";
import { AmenitiesSection } from "./sections/AmenitiesSection";
import { TravelSection } from "./sections/TravelSection";
import { AttendeesSection } from "./sections/AttendeesSection";
import { SectionGroupIntro } from "./sections/SectionGroupIntro";

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

function useSectionHashSync() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const sectionIds = Object.values(SECTION_IDS);

    const getSections = () =>
      sectionIds
        .map((id) => document.getElementById(id))
        .filter((section): section is HTMLElement => section !== null);
    let activeSectionId: string | null = null;
    let frame = 0;

    const syncHash = (nextSectionId: string) => {
      if (activeSectionId === nextSectionId) {
        return;
      }
      activeSectionId = nextSectionId;
      if (window.location.hash === `#${nextSectionId}`) {
        return;
      }
      const url = `${window.location.pathname}${window.location.search}#${nextSectionId}`;
      window.history.replaceState(window.history.state, "", url);
    };

    const getActiveSectionId = () => {
      const sections = getSections();
      if (sections.length === 0) {
        return null;
      }
      const anchorY = 140;
      const reachedSections = sections.filter(
        (section) => section.getBoundingClientRect().top <= anchorY
      );
      if (reachedSections.length > 0) {
        const lastReached = reachedSections[reachedSections.length - 1];
        return lastReached.id;
      }

      return sections[0].id;
    };

    const update = () => {
      frame = 0;
      const nextSectionId = getActiveSectionId();
      if (nextSectionId) {
        syncHash(nextSectionId);
      }
    };

    const scheduleUpdate = () => {
      if (frame) {
        return;
      }
      frame = window.requestAnimationFrame(update);
    };

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, []);
}

export function Component() {
  const [effectsReady, setEffectsReady] = useState(false);
  useSectionHashSync();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    setEffectsReady(true);
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
          <SectionGroupIntro
            id={SECTION_IDS.EVENT_GROUP}
            titleKey="convention.groups.event.title"
            subtitleKey="convention.groups.event.subtitle"
            descriptionKey="convention.groups.event.description"
            accent="gold"
          />
          <EventOverviewSection />
          <EventsSection />
          <RegistrationSection />
          <VenueSection />
          <SectionGroupIntro
            id={SECTION_IDS.PLACE_GROUP}
            titleKey="convention.groups.place.title"
            subtitleKey="convention.groups.place.subtitle"
            descriptionKey="convention.groups.place.description"
            noteKey="convention.groups.place.note"
            accent="red"
          />
          <AmenitiesSection />
          <TravelSection />
          <SectionGroupIntro
            id={SECTION_IDS.COMMUNITY_GROUP}
            titleKey="convention.groups.community.title"
            subtitleKey="convention.groups.community.subtitle"
            descriptionKey="convention.groups.community.description"
            accent="green"
          />
          <AttendeesSection />
          <NewsSection />
          <GuestsSection />
          <FaqSection />
        </Suspense>
        <FooterSection />
      </div>
    </div>
  );
}
