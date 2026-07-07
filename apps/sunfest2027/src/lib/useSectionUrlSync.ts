import { useEffect, useRef } from "react";
import { SECTION_IDS } from "@/content";

/** Keys that signal a deliberate user scroll (vs. a programmatic one). */
const SCROLL_INTENT_KEYS = new Set([
  "ArrowDown",
  "ArrowUp",
  "PageDown",
  "PageUp",
  "Home",
  "End",
  " ",
]);

/** Viewport offset (px) below which a section counts as "active". */
const SECTION_ANCHOR_Y = 140;

/** All section ids and a fast lookup set derived from {@link SECTION_IDS}. */
const SECTION_ID_LIST = Object.values(SECTION_IDS);
const SECTION_ID_SET = new Set<string>(SECTION_ID_LIST);

/** Mutable scroll-sync bookkeeping shared by the effect's event handlers. */
interface SyncState {
  activeSectionId: string | null;
  autoScrollTargetId: string | null;
  hasManualScrollIntent: boolean;
  frame: number;
  readonly startedWithSectionQuery: boolean;
}

/** Read a valid `section` id from the current URL query, or `null`. */
function getSectionIdFromUrl(): string | null {
  const fromQuery = new URLSearchParams(window.location.search).get("section");
  return fromQuery && SECTION_ID_SET.has(fromQuery) ? fromQuery : null;
}

/** Scroll a section into view immediately; returns whether it existed yet. */
function scrollToSection(sectionId: string): boolean {
  const section = document.getElementById(sectionId);
  if (!section) {
    return false;
  }
  section.scrollIntoView({ behavior: "instant" });
  return true;
}

/** Retry scrolling until the target section has mounted (or retries run out). */
function scrollToSectionWhenReady(sectionId: string, retries = 90): void {
  if (scrollToSection(sectionId) || retries <= 0) {
    return;
  }
  window.requestAnimationFrame(() => {
    scrollToSectionWhenReady(sectionId, retries - 1);
  });
}

/** Return the id of the last section whose top has crossed the anchor line. */
function getActiveSectionId(): string | null {
  const sections = SECTION_ID_LIST.map((id) => document.getElementById(id))
    .filter((section): section is HTMLElement => section !== null)
    .sort((left, right) => left.offsetTop - right.offsetTop);
  if (sections.length === 0) {
    return null;
  }
  const reached = sections.filter(
    (section) => section.getBoundingClientRect().top <= SECTION_ANCHOR_Y
  );
  if (reached.length > 0) {
    return reached.at(-1)?.id ?? null;
  }
  return sections[0]?.id ?? null;
}

/** Persist the active section id into the URL query via `replaceState`. */
function writeSectionToUrl(sectionId: string): void {
  const params = new URLSearchParams(window.location.search);
  if (sectionId === SECTION_IDS.hero) {
    params.delete("section");
  } else {
    params.set("section", sectionId);
  }
  const query = params.toString();
  const nextUrl = query
    ? `${window.location.pathname}?${query}`
    : window.location.pathname;
  window.history.replaceState({ __sectionSync: true }, "", nextUrl);
}

/** Write the next section id to the URL unless a guard suppresses it. */
function syncSectionUrl(state: SyncState, nextSectionId: string): void {
  if (
    (state.startedWithSectionQuery && !state.hasManualScrollIntent) ||
    state.autoScrollTargetId ||
    state.activeSectionId === nextSectionId
  ) {
    return;
  }
  state.activeSectionId = nextSectionId;
  writeSectionToUrl(nextSectionId);
}

/** Recompute the active section and reconcile it with any pending auto-scroll. */
function updateActiveSection(state: SyncState): void {
  state.frame = 0;
  const nextSectionId = getActiveSectionId();
  if (!nextSectionId) {
    return;
  }
  if (state.autoScrollTargetId) {
    if (nextSectionId !== state.autoScrollTargetId) {
      return;
    }
    state.autoScrollTargetId = null;
  }
  syncSectionUrl(state, nextSectionId);
}

/** Attach scroll/resize/intent listeners; returns a cleanup function. */
function registerSectionSyncListeners(handlers: {
  readonly scheduleUpdate: () => void;
  readonly onManualScrollIntent: () => void;
  readonly onKeyDown: (event: KeyboardEvent) => void;
}): () => void {
  const { scheduleUpdate, onManualScrollIntent, onKeyDown } = handlers;
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
}

/**
 * Keeps the `?section=` query in sync with the section scrolled into view, and
 * scrolls to the queried section on load. Router-free: reads `location.search`
 * directly (sunfest has no react-router). Ported from moonfest's ConventionPage.
 */
export function useSectionUrlSync(): void {
  const hasScrolledRef = useRef(false);

  useEffect(() => {
    const state: SyncState = {
      activeSectionId: null,
      autoScrollTargetId: null,
      hasManualScrollIntent: false,
      frame: 0,
      startedWithSectionQuery: getSectionIdFromUrl() !== null,
    };

    const scheduleUpdate = () => {
      if (state.frame) {
        return;
      }
      state.frame = window.requestAnimationFrame(() => {
        updateActiveSection(state);
      });
    };
    const onManualScrollIntent = () => {
      state.hasManualScrollIntent = true;
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (SCROLL_INTENT_KEYS.has(event.key)) {
        state.hasManualScrollIntent = true;
      }
    };

    const initialSectionId = getSectionIdFromUrl();
    if (
      initialSectionId &&
      initialSectionId !== SECTION_IDS.hero &&
      !hasScrolledRef.current
    ) {
      hasScrolledRef.current = true;
      state.activeSectionId = initialSectionId;
      state.autoScrollTargetId = initialSectionId;
      scrollToSectionWhenReady(initialSectionId);
    }

    scheduleUpdate();
    const removeListeners = registerSectionSyncListeners({
      scheduleUpdate,
      onManualScrollIntent,
      onKeyDown,
    });
    return () => {
      if (state.frame) {
        window.cancelAnimationFrame(state.frame);
      }
      removeListeners();
    };
  }, []);
}
