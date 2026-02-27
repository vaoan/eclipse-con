import { tid } from "@/shared/application/utils/tid";
import { SECTION_IDS } from "@/features/convention/domain/constants";
import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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

const SCROLL_INTENT_KEYS = new Set([
  "ArrowDown",
  "ArrowUp",
  "PageDown",
  "PageUp",
  "Home",
  "End",
  " ",
]);

const getRenderableSections = (sectionIds: string[]) =>
  sectionIds
    .map((id) => document.getElementById(id))
    .filter((section): section is HTMLElement => section !== null);

const getSectionIdFromUrl = (
  locationSearch: string,
  sectionIdSet: Set<string>
) => {
  const querySources: string[] = [locationSearch, window.location.search];
  const hash = window.location.hash;
  const hashQueryIndex = hash.indexOf("?");
  if (hashQueryIndex >= 0) {
    querySources.push(hash.slice(hashQueryIndex));
  }

  for (const source of querySources) {
    if (!source) {
      continue;
    }
    const sectionFromQuery = new URLSearchParams(source).get("section");
    if (sectionFromQuery && sectionIdSet.has(sectionFromQuery)) {
      return sectionFromQuery;
    }
  }

  const sectionRegex = /[?&]section=([^&#]+)/i;
  const hrefMatch = sectionRegex.exec(window.location.href);
  if (hrefMatch?.[1]) {
    const sectionFromHref = decodeURIComponent(hrefMatch[1]);
    if (sectionIdSet.has(sectionFromHref)) {
      return sectionFromHref;
    }
  }
  return null;
};

const scrollToSection = (sectionId: string) => {
  if (sectionId === SECTION_IDS.HERO) {
    window.scrollTo({ top: 0 });
    return true;
  }
  const section = document.getElementById(sectionId);
  if (!section) {
    return false;
  }
  section.scrollIntoView();
  return true;
};

const scrollToSectionWhenReady = (sectionId: string, retries = 90) => {
  if (scrollToSection(sectionId) || retries <= 0) {
    return;
  }
  window.requestAnimationFrame(() => {
    scrollToSectionWhenReady(sectionId, retries - 1);
  });
};

const getActiveSectionId = (sectionIds: string[]) => {
  const sections = getRenderableSections(sectionIds).sort(
    (left, right) => left.offsetTop - right.offsetTop
  );
  if (sections.length === 0) {
    return null;
  }
  const anchorY = 140;
  const reachedSections = sections.filter(
    (section) => section.getBoundingClientRect().top <= anchorY
  );
  if (reachedSections.length > 0) {
    const lastReached = reachedSections[reachedSections.length - 1];
    return lastReached?.id ?? null;
  }
  return sections[0]?.id ?? null;
};

const applyInitialSectionScroll = ({
  initialSectionId,
  isSectionSyncNavigation,
  lastAutoScrolledSectionRef,
  setActiveSectionId,
  setAutoScrollTargetId,
}: {
  initialSectionId: string | null;
  isSectionSyncNavigation: boolean;
  lastAutoScrolledSectionRef: { current: string | null };
  setActiveSectionId: (sectionId: string) => void;
  setAutoScrollTargetId: (sectionId: string) => void;
}) => {
  if (
    !initialSectionId ||
    isSectionSyncNavigation ||
    lastAutoScrolledSectionRef.current === initialSectionId
  ) {
    return;
  }
  lastAutoScrolledSectionRef.current = initialSectionId;
  setActiveSectionId(initialSectionId);
  setAutoScrollTargetId(initialSectionId);
  scrollToSectionWhenReady(initialSectionId);
};

const registerSectionSyncListeners = ({
  scheduleUpdate,
  onManualScrollIntent,
  onKeyDown,
}: {
  scheduleUpdate: () => void;
  onManualScrollIntent: () => void;
  onKeyDown: (event: KeyboardEvent) => void;
}) => {
  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate);
  window.addEventListener("wheel", onManualScrollIntent, { passive: true });
  window.addEventListener("touchmove", onManualScrollIntent, { passive: true });
  window.addEventListener("keydown", onKeyDown);
  return () => {
    window.removeEventListener("scroll", scheduleUpdate);
    window.removeEventListener("resize", scheduleUpdate);
    window.removeEventListener("wheel", onManualScrollIntent);
    window.removeEventListener("touchmove", onManualScrollIntent);
    window.removeEventListener("keydown", onKeyDown);
  };
};

function useSectionUrlSync() {
  const location = useLocation();
  const navigate = useNavigate();
  const lastAutoScrolledSectionRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const sectionIds = Object.values(SECTION_IDS);
    const sectionIdSet = new Set<string>(sectionIds);
    const sectionSyncState = location.state as {
      __sectionSync?: boolean;
    } | null;
    const isSectionSyncNavigation = !!sectionSyncState?.__sectionSync;
    let activeSectionId: string | null = null;
    let frame = 0;
    let autoScrollTargetId: string | null = null;
    const startedWithSectionQuery = /[?&]section=/.test(window.location.href);
    let hasManualScrollIntent = false;

    const syncSectionUrl = (nextSectionId: string) => {
      if (
        (startedWithSectionQuery && !hasManualScrollIntent) ||
        autoScrollTargetId ||
        activeSectionId === nextSectionId
      ) {
        return;
      }
      activeSectionId = nextSectionId;
      const params = new URLSearchParams(window.location.search);
      const currentQuerySection = getSectionIdFromUrl(
        location.search,
        sectionIdSet
      );
      if (currentQuerySection === nextSectionId) {
        return;
      }
      params.set("section", nextSectionId);
      const query = params.toString();
      void navigate(
        {
          pathname: location.pathname,
          search: query ? `?${query}` : "",
        },
        { replace: true, state: { __sectionSync: true } }
      );
    };

    const update = () => {
      frame = 0;
      const nextSectionId = getActiveSectionId(sectionIds);
      if (nextSectionId) {
        if (autoScrollTargetId) {
          if (nextSectionId !== autoScrollTargetId) {
            return;
          }
          autoScrollTargetId = null;
        }
        syncSectionUrl(nextSectionId);
      }
    };

    const scheduleUpdate = () => {
      if (frame) {
        return;
      }
      frame = window.requestAnimationFrame(update);
    };

    const onManualScrollIntent = () => {
      hasManualScrollIntent = true;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (SCROLL_INTENT_KEYS.has(event.key)) {
        hasManualScrollIntent = true;
      }
    };

    const initialSectionId = getSectionIdFromUrl(location.search, sectionIdSet);
    applyInitialSectionScroll({
      initialSectionId,
      isSectionSyncNavigation,
      lastAutoScrolledSectionRef,
      setActiveSectionId: (sectionId) => {
        activeSectionId = sectionId;
      },
      setAutoScrollTargetId: (sectionId) => {
        autoScrollTargetId = sectionId;
      },
    });

    scheduleUpdate();
    const removeListeners = registerSectionSyncListeners({
      scheduleUpdate,
      onManualScrollIntent,
      onKeyDown,
    });
    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      removeListeners();
    };
  }, [location.pathname, location.search, location.state, navigate]);
}

export function Component() {
  const [effectsReady, setEffectsReady] = useState(false);
  useSectionUrlSync();

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
            accent="gold"
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
