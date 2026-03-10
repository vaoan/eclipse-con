import { tid } from "@/shared/application/utils/tid";
import { SECTION_IDS } from "@/features/convention/domain/constants";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import { NavigationBar } from "./components/NavigationBar";
import { SakuraParticles } from "./components/SakuraParticles";
import { HeroCanvasSky } from "./components/HeroCanvasSky";
import { PostHeroBackground } from "./components/PostHeroBackground";
import { HeroSection } from "./sections/HeroSection";
import { FooterSection } from "./sections/FooterSection";
import { AmenitiesSection } from "./sections/AmenitiesSection";
import { TravelSection } from "./sections/TravelSection";
import { SectionGroupIntro } from "./sections/SectionGroupIntro";
import { AboutSection } from "./sections/AboutSection";
import { EventsSection } from "./sections/EventsSection";
import { VenueSection } from "./sections/VenueSection";
import { RegistrationSection } from "./sections/RegistrationSection";
import { TicketingSection } from "./sections/TicketingSection";
import { FaqSection } from "./sections/FaqSection";
import { NewsSection } from "./sections/NewsSection";
import { GuestsSection } from "./sections/GuestsSection";

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
  const section = document.getElementById(sectionId);
  if (!section) {
    return false;
  }
  section.scrollIntoView({ behavior: "instant" });
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

/**
 * Returns `true` when the current page context is a full browser load or
 * reload (as opposed to an in-app React Router navigation). Used to decide
 * whether persisted `location.state` should be trusted.
 */
const isFullPageLoad = () =>
  typeof performance !== "undefined" &&
  performance
    .getEntriesByType("navigation")
    .some(
      (entry) =>
        (entry as PerformanceNavigationTiming).type === "reload" ||
        (entry as PerformanceNavigationTiming).type === "navigate"
    );

function useSectionUrlSync() {
  const location = useLocation();
  const lastAutoScrolledSectionRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const sectionIds = Object.values(SECTION_IDS);
    const sectionIdSet = new Set<string>(sectionIds);
    const historyState = window.history.state as {
      __sectionSync?: boolean;
    } | null;
    /* __sectionSync is set by scroll-based URL updates (replaceState).
       On a full page load/reload, history.state may still carry this flag
       from the previous session — ignore it so the initial scroll works. */
    const isSectionSyncNavigation =
      !isFullPageLoad() && !!historyState?.__sectionSync;
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
        window.location.search,
        sectionIdSet
      );
      if (currentQuerySection === nextSectionId) {
        return;
      }
      params.set("section", nextSectionId);
      const query = params.toString();
      /* Use replaceState directly to avoid React Router re-renders.
         navigate() would change location.search → trigger effect cleanup
         → re-register listeners → reset state, causing scroll jank. */
      window.history.replaceState(
        { __sectionSync: true },
        "",
        `${location.pathname}${query ? "?" + query : ""}`
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
  }, [location.pathname, location.search]);
}

/**
 * Root page component for the convention. Composes all sections in order,
 * manages section-based URL sync, and lazily loads heavy sections.
 * Exported as `Component` for React Router's `lazy` route loader.
 */
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
      {/* Fixed star canvas — always behind everything */}
      {effectsReady && <HeroCanvasSky fixed className="z-0" />}

      <div className="relative z-10">
        <NavigationBar />
        {effectsReady && <SakuraParticles />}

        {/* Layer 1: Hero sticky — bath + title + CTA, sticks at top */}
        <div id={SECTION_IDS.HERO} aria-hidden="true" />
        <HeroSection />

        {/* Layer 2: Post-hero sticky — covers the hero with opaque bg + logo/text.
            Visible through semi-transparent "elevated" sections */}
        <PostHeroBackground />

        {/* Layer 3: Content sections — pull up to overlap the post-hero bg layer */}
        <div className="relative z-[2] -mt-[100vh]">
          <AboutSection />
          <EventsSection />
          <RegistrationSection />
          <TicketingSection />
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
          <NewsSection />
          <GuestsSection />
          <FaqSection />
          <FooterSection />
        </div>
      </div>
    </div>
  );
}
