/* eslint-disable max-lines, max-lines-per-function, sonarjs/cognitive-complexity */
import {
  type AnalyticsEvent,
  type Primitive,
  type TrackedEventName,
  type TrackingOptions,
} from "@/features/analytics/infrastructure/trackingSchema";
import { sanitizeEventData } from "@/features/analytics/infrastructure/trackingPrivacy";
import {
  getDatasetSignals,
  getLanguage,
  getPath,
  getQueryKeys,
  getSafeElementData,
  getViewportBucket,
} from "@/features/analytics/infrastructure/trackingBrowserContext";
import { registerCustomTrackingListeners } from "@/features/analytics/infrastructure/trackingCustomEvents";
import {
  getConnectionType,
  getContextSignals,
  getDevicePerformanceClass,
  getDurationBucket,
  getPagesPerSessionBucket,
  getReferralCampaignBucket,
  getWebVitalBuckets,
} from "@/features/analytics/infrastructure/trackingSignals";
import {
  getCtaPositionBucket,
  getDurationBucketFromMs,
  getFormErrorType,
  getFaqActionFromTarget,
  getFirstInteractionBucket,
  getMenuActionFromTarget,
  getNewsActionFromTarget,
  getOutboundDomainBucket,
  getQueryLengthBucket,
  getReservationLeadTimeBucket,
  getResultCountBucket,
  getSectionIdFromTarget,
} from "@/features/analytics/infrastructure/trackingInteractionSignals";

const EVENT_QUEUE_LIMIT = 200;
const FLUSH_INTERVAL_MS = 5000;
const SESSION_KEY = "analytics_session_id";
const ANON_KEY = "analytics_anon_id";
const RESERVATION_EVENT_DATE = "2026-07-10T00:00:00.000Z";
const ANALYTICS_ONLY_EVENTS = new Set<TrackedEventName>([
  "copy_interaction",
  "search_interaction",
  "dwell_time_per_section",
  "return_intent",
  "cta_visibility",
  "nav_path_cluster",
  "form_error_type",
  "media_watch_progress",
  "network_quality_impact",
  "engagement_score_bucket",
  "error_recovery",
  "reservation_lead_time_bucket",
  "scroll_depth",
  "click",
  "rage_click",
  "form_submit",
  "field_change",
  "demographics_submitted",
  "navigation_transition",
  "cta_interaction",
  "faq_interaction",
  "news_engagement",
  "content_interaction",
  "funnel_step",
  "experiment_exposure",
]);

interface TrackingRuntimeState {
  queue: AnalyticsEvent[];
  maxScrollDepth: number;
  currentPage: string;
  clickTimes: number[];
  pageViews: number;
  sessionStartedAt: number;
  activeTimeMs: number;
  visibleStartedAt: number | null;
  firstInteractionTracked: boolean;
  initialLanguage: string;
  sectionSeen: Set<string>;
  sectionDwellMs: Map<string, number>;
  activeSectionId: string | null;
  activeSectionStartedAt: number | null;
  returnIntentTracked: boolean;
  ctaSeen: Set<string>;
  mediaProgressMilestones: WeakMap<HTMLMediaElement, Set<number>>;
  hadRuntimeError: boolean;
  errorRecovered: boolean;
  interactionPath: string[];
  totalClicks: number;
  accessibilityTracked: Set<string>;
}

interface TrackContext {
  options: TrackingOptions;
  state: TrackingRuntimeState;
  baseData: Record<string, Primitive>;
}

let analyticsConsentGranted = false;

export function setAnalyticsConsentGranted(granted: boolean): void {
  analyticsConsentGranted = granted;
}

function createId(): string {
  try {
    return globalThis.crypto.randomUUID();
  } catch {
    const bytes = new Uint8Array(12);
    globalThis.crypto.getRandomValues(bytes);
    const randomSegment = Array.from(bytes, (byte) =>
      byte.toString(16).padStart(2, "0")
    ).join("");
    return `f_${Date.now().toString(36)}_${randomSegment}`;
  }
}

function getOrCreateStorageValue(storage: Storage, key: string): string {
  const existing = storage.getItem(key);
  if (existing) {
    return existing;
  }

  const value = createId();
  storage.setItem(key, value);
  return value;
}

function getDaysUntilReservationEvent(): number {
  const eventDate = new Date(RESERVATION_EVENT_DATE).getTime();
  const now = Date.now();
  return Math.floor((eventDate - now) / (1000 * 60 * 60 * 24));
}

function updateActiveSectionDwell(
  context: TrackContext,
  nextSectionId: string | null
): void {
  const now = Date.now();
  if (
    context.state.activeSectionId &&
    context.state.activeSectionStartedAt !== null
  ) {
    const elapsed = now - context.state.activeSectionStartedAt;
    const previous =
      context.state.sectionDwellMs.get(context.state.activeSectionId) ?? 0;
    context.state.sectionDwellMs.set(
      context.state.activeSectionId,
      previous + elapsed
    );
  }
  context.state.activeSectionId = nextSectionId;
  context.state.activeSectionStartedAt = nextSectionId ? now : null;
}

function getEngagementScoreBucket(context: TrackContext): string {
  const score =
    context.state.pageViews +
    context.state.totalClicks +
    context.state.sectionSeen.size +
    Math.round(context.state.maxScrollDepth / 25);
  if (score <= 8) {
    return "low";
  }
  if (score <= 20) {
    return "medium";
  }
  return "high";
}

function getNavPathCluster(context: TrackContext): string | null {
  if (context.state.interactionPath.length === 0) {
    return null;
  }
  return context.state.interactionPath.slice(0, 5).join(">");
}

function track(
  context: TrackContext,
  name: TrackedEventName,
  data: Record<string, Primitive> = {}
): void {
  if (!analyticsConsentGranted && ANALYTICS_ONLY_EVENTS.has(name)) {
    return;
  }

  const event: AnalyticsEvent = {
    name,
    timestamp: Date.now(),
    path: getPath(),
    queryKeys: getQueryKeys(),
    locale: getLanguage(),
    viewport: getViewportBucket(),
    data: sanitizeEventData(name, data, context.baseData),
  };

  context.state.queue.push(event);
  if (context.state.queue.length > EVENT_QUEUE_LIMIT) {
    context.state.queue.shift();
  }

  if (context.options.debug) {
    // eslint-disable-next-line no-console
    console.debug("[tracking:event]", event);
  }
}

function flush(context: TrackContext, useBeacon: boolean): void {
  if (!context.options.endpoint || context.state.queue.length === 0) {
    return;
  }

  const body = JSON.stringify({
    sentAt: Date.now(),
    events: context.state.queue.splice(0, context.state.queue.length),
  });

  if (useBeacon && typeof navigator.sendBeacon === "function") {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon(context.options.endpoint, blob);
    return;
  }

  void fetch(context.options.endpoint, {
    method: "POST",
    body,
    keepalive: true,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function trackPageView(context: TrackContext, trigger: string): void {
  const path = getPath();
  const previousPath = context.state.currentPage;
  context.state.currentPage = path;
  context.state.pageViews += 1;
  const lastPath =
    context.state.interactionPath.length > 0
      ? context.state.interactionPath[context.state.interactionPath.length - 1]
      : null;
  if (lastPath !== path) {
    context.state.interactionPath.push(path);
  }
  context.state.maxScrollDepth = 0;
  track(context, "page_view", { trigger, path, ...getContextSignals() });

  if (previousPath && previousPath !== path) {
    track(context, "navigation_transition", {
      fromPath: previousPath,
      toPath: path,
    });
  }
}

function patchHistoryNavigationEvent(): void {
  const dispatchNavigationEvent = () => {
    window.dispatchEvent(new Event("analytics:navigation"));
  };
  const getLocationKey = () =>
    `${window.location.pathname}${window.location.search}`;

  const historyPushState = window.history.pushState.bind(window.history);
  const historyReplaceState = window.history.replaceState.bind(window.history);

  window.history.pushState = (...args: Parameters<History["pushState"]>) => {
    const beforeKey = getLocationKey();
    historyPushState(...args);
    if (beforeKey !== getLocationKey()) {
      dispatchNavigationEvent();
    }
  };

  window.history.replaceState = (
    ...args: Parameters<History["replaceState"]>
  ) => {
    const beforeKey = getLocationKey();
    historyReplaceState(...args);
    if (beforeKey !== getLocationKey()) {
      dispatchNavigationEvent();
    }
  };
}

function createOnScroll(context: TrackContext): () => void {
  return () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const documentHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    if (documentHeight <= 0) {
      return;
    }

    const depth = Math.min(100, Math.round((scrollTop / documentHeight) * 100));
    if (depth <= context.state.maxScrollDepth) {
      return;
    }

    context.state.maxScrollDepth = depth;
    if (context.state.maxScrollDepth % 25 === 0) {
      track(context, "scroll_depth", {
        depth: context.state.maxScrollDepth,
        page: context.state.currentPage,
      });
    }
  };
}

function createOnClick(context: TrackContext): (event: MouseEvent) => void {
  return (event) => {
    if (!context.state.firstInteractionTracked) {
      context.state.firstInteractionTracked = true;
      track(context, "time_to_first_interaction", {
        bucket: getFirstInteractionBucket(
          Date.now() - context.state.sessionStartedAt
        ),
      });
    }

    const elementData = getSafeElementData(event.target);
    const datasetSignals = getDatasetSignals(event.target);
    const sectionId = getSectionIdFromTarget(event.target);
    const outboundDomainBucket = getOutboundDomainBucket(event.target);
    const navMenuAction = getMenuActionFromTarget(event.target);
    const faqAction = getFaqActionFromTarget(event.target);
    const newsAction = getNewsActionFromTarget(event.target);
    const currentConnectionType = getConnectionType();

    if (elementData) {
      track(context, "click", elementData);
    }
    context.state.totalClicks += 1;
    if (outboundDomainBucket) {
      track(context, "outbound_link_click", {
        domainBucket: outboundDomainBucket,
      });
    }
    if (navMenuAction) {
      track(context, "navigation_menu_usage", {
        action: navMenuAction,
      });
    }
    if (faqAction) {
      track(context, "faq_interaction", {
        faqId: faqAction.faqId,
        action: faqAction.action,
      });
    }
    if (newsAction) {
      track(context, "news_engagement", {
        action: newsAction.action,
        layoutMode: window.localStorage.getItem("newsLayoutMode") ?? null,
        itemId: newsAction.itemId,
      });
    }
    if (datasetSignals?.funnelStep) {
      track(context, "funnel_step", {
        step: datasetSignals.funnelStep,
        ctaId: datasetSignals.ctaId,
        ctaVariant: datasetSignals.ctaVariant,
      });
      track(context, "network_quality_impact", {
        step: datasetSignals.funnelStep,
        connectionType: currentConnectionType,
      });
      if (
        datasetSignals.funnelStep === "click_reserve" ||
        datasetSignals.funnelStep === "start_checkout" ||
        datasetSignals.funnelStep === "complete_checkout"
      ) {
        track(context, "reservation_lead_time_bucket", {
          bucket: getReservationLeadTimeBucket(getDaysUntilReservationEvent()),
        });
      }
      if (
        context.state.hadRuntimeError &&
        !context.state.errorRecovered &&
        datasetSignals.funnelStep === "complete_checkout"
      ) {
        context.state.errorRecovered = true;
        track(context, "error_recovery", { status: "recovered" });
      }
    }
    if (datasetSignals?.contentId && datasetSignals.contentSection) {
      track(context, "content_interaction", {
        sectionId: datasetSignals.contentSection,
        contentId: datasetSignals.contentId,
        interactionType: datasetSignals.contentInteraction ?? "open",
      });
    }
    if (datasetSignals?.experimentId && datasetSignals.variantId) {
      track(context, "experiment_exposure", {
        experimentId: datasetSignals.experimentId,
        variantId: datasetSignals.variantId,
      });
    }
    if (datasetSignals?.ctaId) {
      track(context, "cta_interaction", {
        ctaId: datasetSignals.ctaId,
        ctaVariant: datasetSignals.ctaVariant,
        ctaPosition: getCtaPositionBucket(event.target),
        sectionId,
      });
    }

    const now = Date.now();
    context.state.clickTimes = context.state.clickTimes.filter(
      (time) => now - time < 1000
    );
    context.state.clickTimes.push(now);

    if (context.state.clickTimes.length >= 3) {
      track(context, "rage_click", {
        clickCount: context.state.clickTimes.length,
      });
    }
  };
}

function createOnFieldChange(context: TrackContext): (event: Event) => void {
  return (event) => {
    const target = event.target;
    if (
      !(target instanceof HTMLInputElement) &&
      !(target instanceof HTMLSelectElement) &&
      !(target instanceof HTMLTextAreaElement)
    ) {
      return;
    }

    track(context, "field_change", {
      tag: target.tagName.toLowerCase(),
      inputType: target instanceof HTMLInputElement ? target.type : null,
      checked:
        target instanceof HTMLInputElement &&
        (target.type === "checkbox" || target.type === "radio")
          ? target.checked
          : null,
    });

    if (target.matches("select,[role='combobox']")) {
      const parentSectionId = getSectionIdFromTarget(target);
      if (parentSectionId === "news") {
        track(context, "news_engagement", {
          action: "layout_change",
          layoutMode: window.localStorage.getItem("newsLayoutMode") ?? null,
          itemId: null,
        });
      }
    }
  };
}

function createOnInput(context: TrackContext): (event: Event) => void {
  return (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }
    if (target.type !== "search" && !target.dataset.searchSource) {
      return;
    }

    const rawResultCount = target.dataset.searchResults
      ? Number(target.dataset.searchResults)
      : null;
    track(context, "search_interaction", {
      queryLengthBucket: getQueryLengthBucket(target.value.length),
      resultCountBucket: getResultCountBucket(rawResultCount),
      sourceId: target.dataset.searchSource ?? getSectionIdFromTarget(target),
    });
  };
}

function createOnCopy(context: TrackContext): (event: ClipboardEvent) => void {
  return (event) => {
    const sourceElement =
      event.target instanceof Element
        ? event.target.closest<HTMLElement>("[data-copy-source], section[id]")
        : null;
    const sourceId =
      sourceElement?.dataset.copySource ??
      (sourceElement instanceof HTMLElement && sourceElement.id
        ? sourceElement.id
        : "unknown");
    track(context, "copy_interaction", { sourceId });
  };
}

function createOnInvalid(context: TrackContext): (event: Event) => void {
  return (event) => {
    const error = getFormErrorType(event.target);
    if (!error) {
      return;
    }

    track(context, "form_error_type", {
      errorType: error.errorType,
      fieldType: error.fieldType,
    });
  };
}

function createOnMouseOut(context: TrackContext): (event: MouseEvent) => void {
  return (event) => {
    if (context.state.returnIntentTracked) {
      return;
    }
    if (event.relatedTarget !== null) {
      return;
    }
    if (event.clientY > 24) {
      return;
    }

    context.state.returnIntentTracked = true;
    track(context, "return_intent", { action: "detected" });
  };
}

function createOnKeydown(
  context: TrackContext
): (event: KeyboardEvent) => void {
  return (event) => {
    if (event.key !== "Tab") {
      return;
    }
    if (context.state.accessibilityTracked.has("keyboard_navigation")) {
      return;
    }

    context.state.accessibilityTracked.add("keyboard_navigation");
    track(context, "accessibility_usage", { mode: "keyboard_navigation" });
  };
}

function createOnMediaTimeUpdate(
  context: TrackContext
): (event: Event) => void {
  return (event) => {
    const target = event.target;
    if (!(target instanceof HTMLMediaElement)) {
      return;
    }
    if (!Number.isFinite(target.duration) || target.duration <= 0) {
      return;
    }

    const seenMilestones =
      context.state.mediaProgressMilestones.get(target) ?? new Set<number>();
    const progressPercentage = Math.round(
      (target.currentTime / target.duration) * 100
    );
    const milestones = [25, 50, 75, 100];
    for (const milestone of milestones) {
      if (progressPercentage < milestone || seenMilestones.has(milestone)) {
        continue;
      }
      seenMilestones.add(milestone);
      track(context, "media_watch_progress", {
        mediaType: target.tagName.toLowerCase(),
        progress: `${milestone}%`,
      });
    }
    context.state.mediaProgressMilestones.set(target, seenMilestones);
  };
}

function createOnFormSubmit(context: TrackContext): (event: Event) => void {
  return (event) => {
    const form = event.target instanceof HTMLFormElement ? event.target : null;
    const fieldCount = form
      ? form.querySelectorAll("input,select,textarea").length
      : 0;
    track(context, "form_submit", { fieldCount });
  };
}

function createOnVisibilityChange(context: TrackContext): () => void {
  return () => {
    track(context, "visibility_change", { state: document.visibilityState });
    if (document.visibilityState === "visible") {
      context.state.visibleStartedAt = Date.now();
    }
    if (
      document.visibilityState === "hidden" &&
      context.state.visibleStartedAt !== null
    ) {
      context.state.activeTimeMs += Date.now() - context.state.visibleStartedAt;
      context.state.visibleStartedAt = null;
    }
    if (document.visibilityState === "hidden") {
      flush(context, true);
    }
  };
}

function createOnError(context: TrackContext): (event: ErrorEvent) => void {
  return (event) => {
    context.state.hadRuntimeError = true;
    const source = event.filename
      ? (() => {
          const segments = event.filename.split("/");
          const lastSegment = segments[segments.length - 1];
          return lastSegment ?? null;
        })()
      : null;
    track(context, "js_error", {
      source,
      line: event.lineno || null,
      column: event.colno || null,
    });
  };
}

function recordPerformanceSnapshot(context: TrackContext): void {
  track(context, "performance_snapshot", getWebVitalBuckets());
}

function trackSessionEnd(context: TrackContext): void {
  if (context.state.visibleStartedAt !== null) {
    context.state.activeTimeMs += Date.now() - context.state.visibleStartedAt;
    context.state.visibleStartedAt = null;
  }

  const totalDurationMs = Date.now() - context.state.sessionStartedAt;
  track(context, "session_end", {
    durationBucket: getDurationBucket(totalDurationMs),
    pagesPerSessionBucket: getPagesPerSessionBucket(context.state.pageViews),
    activeTimeBucket: getDurationBucket(context.state.activeTimeMs),
  });

  const pathCluster = getNavPathCluster(context);
  if (pathCluster) {
    track(context, "nav_path_cluster", { cluster: pathCluster });
  }

  for (const [sectionId, dwellMs] of context.state.sectionDwellMs.entries()) {
    track(context, "dwell_time_per_section", {
      sectionId,
      durationBucket: getDurationBucketFromMs(dwellMs),
    });
  }

  track(context, "engagement_score_bucket", {
    bucket: getEngagementScoreBucket(context),
  });

  if (context.state.hadRuntimeError && !context.state.errorRecovered) {
    track(context, "error_recovery", { status: "not_recovered" });
  }
}

function attachListeners(context: TrackContext): void {
  const trackNavigationIfPathChanged = () => {
    const nextPath = getPath();
    if (nextPath === context.state.currentPage) {
      return;
    }
    trackPageView(context, "history_change");
  };

  document.addEventListener("click", createOnClick(context), true);
  document.addEventListener("submit", createOnFormSubmit(context), true);
  document.addEventListener("change", createOnFieldChange(context), true);
  document.addEventListener("input", createOnInput(context), true);
  document.addEventListener("copy", createOnCopy(context), true);
  document.addEventListener("invalid", createOnInvalid(context), true);
  document.addEventListener("keydown", createOnKeydown(context), true);
  document.addEventListener(
    "timeupdate",
    createOnMediaTimeUpdate(context),
    true
  );
  document.addEventListener(
    "visibilitychange",
    createOnVisibilityChange(context)
  );
  document.addEventListener(
    "error",
    (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      const tag = target.tagName.toLowerCase();
      if (tag === "img" || tag === "video" || tag === "audio") {
        track(context, "media_load_health", {
          mediaType: tag,
          status: "error",
        });
        return;
      }
      if (tag === "script" || tag === "link") {
        track(context, "page_load_failure", {
          resourceType: tag,
        });
      }
    },
    true
  );
  document.addEventListener(
    "load",
    (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }
      const tag = target.tagName.toLowerCase();
      if (tag === "img" || tag === "video" || tag === "audio") {
        track(context, "media_load_health", {
          mediaType: tag,
          status: "loaded",
        });
      }
    },
    true
  );
  window.addEventListener("error", createOnError(context));
  window.addEventListener("unhandledrejection", () => {
    track(context, "unhandled_rejection");
  });
  window.addEventListener("online", () => {
    track(context, "network_change", {
      online: navigator.onLine,
      connectionType: getConnectionType(),
    });
  });
  window.addEventListener("offline", () => {
    track(context, "network_change", {
      online: navigator.onLine,
      connectionType: getConnectionType(),
    });
  });
  window.addEventListener("beforeunload", () => {
    updateActiveSectionDwell(context, null);
    trackSessionEnd(context);
    flush(context, true);
  });
  window.addEventListener("mouseout", createOnMouseOut(context), true);
  window.addEventListener("analytics:navigation", trackNavigationIfPathChanged);
  registerCustomTrackingListeners({
    onDemographics: (payload) => {
      track(context, "demographics_submitted", {
        gender: payload.gender,
        ageRange: payload.ageRange,
        attendeeType: payload.attendeeType ?? null,
        regionBucket: payload.regionBucket ?? null,
        country: payload.country ? payload.country.toUpperCase() : null,
      });
    },
    onContentInteraction: (payload) => {
      track(context, "content_interaction", {
        sectionId: payload.sectionId,
        contentId: payload.contentId,
        interactionType: payload.interactionType,
      });
    },
    onFunnelStep: (payload) => {
      track(context, "funnel_step", {
        step: payload.step,
        ctaId: payload.ctaId ?? null,
        ctaVariant: payload.ctaVariant ?? null,
      });
      track(context, "network_quality_impact", {
        step: payload.step,
        connectionType: getConnectionType(),
      });
      if (
        payload.step === "click_reserve" ||
        payload.step === "start_checkout" ||
        payload.step === "complete_checkout"
      ) {
        track(context, "reservation_lead_time_bucket", {
          bucket: getReservationLeadTimeBucket(getDaysUntilReservationEvent()),
        });
      }
      if (
        context.state.hadRuntimeError &&
        !context.state.errorRecovered &&
        payload.step === "complete_checkout"
      ) {
        context.state.errorRecovered = true;
        track(context, "error_recovery", { status: "recovered" });
      }
    },
    onExperimentExposure: (payload) => {
      track(context, "experiment_exposure", {
        experimentId: payload.experimentId,
        variantId: payload.variantId,
      });
    },
  });
  window.addEventListener("popstate", trackNavigationIfPathChanged);
  window.addEventListener("scroll", createOnScroll(context), { passive: true });
  window.setTimeout(() => {
    recordPerformanceSnapshot(context);
  }, 0);
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const section = entry.target as HTMLElement;
        if (!section.id) {
          continue;
        }
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          updateActiveSectionDwell(context, section.id);
          if (!context.state.sectionSeen.has(section.id)) {
            context.state.sectionSeen.add(section.id);
            track(context, "section_impression", { sectionId: section.id });
          }
        } else if (context.state.activeSectionId === section.id) {
          updateActiveSectionDwell(context, null);
        }
      }
    },
    {
      threshold: [0.5],
    }
  );
  document.querySelectorAll("section[id]").forEach((section) => {
    sectionObserver.observe(section);
  });
  const ctaObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          continue;
        }
        const target = entry.target as HTMLElement;
        const ctaId = target.dataset.ctaId;
        if (!ctaId || context.state.ctaSeen.has(ctaId)) {
          continue;
        }
        context.state.ctaSeen.add(ctaId);
        track(context, "cta_visibility", {
          ctaId,
          ctaVariant: target.dataset.ctaVariant ?? null,
          sectionId: getSectionIdFromTarget(target),
        });
      }
    },
    { threshold: [0.35] }
  );
  document.querySelectorAll<HTMLElement>("[data-cta-id]").forEach((element) => {
    ctaObserver.observe(element);
  });
  const localeObserver = new MutationObserver(() => {
    const language =
      document.documentElement.lang || navigator.language || "unknown";
    if (language === context.state.initialLanguage) {
      return;
    }
    context.state.initialLanguage = language;
    track(context, "locale_switch", { toLocale: language });
  });
  localeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["lang"],
  });
  const reducedMotionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );
  if (reducedMotionQuery.matches) {
    context.state.accessibilityTracked.add("reduced_motion");
    track(context, "accessibility_usage", { mode: "reduced_motion" });
  }
  window.setInterval(() => {
    flush(context, false);
  }, FLUSH_INTERVAL_MS);
}

export function initExtremeTracking(options: TrackingOptions): void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }
  if (!options.enabled) {
    return;
  }

  patchHistoryNavigationEvent();

  const sessionId = getOrCreateStorageValue(window.sessionStorage, SESSION_KEY);
  const anonymousId = getOrCreateStorageValue(window.localStorage, ANON_KEY);
  const context: TrackContext = {
    options,
    state: {
      queue: [],
      maxScrollDepth: 0,
      currentPage: getPath(),
      clickTimes: [],
      pageViews: 0,
      sessionStartedAt: Date.now(),
      activeTimeMs: 0,
      visibleStartedAt:
        document.visibilityState === "visible" ? Date.now() : null,
      firstInteractionTracked: false,
      initialLanguage:
        document.documentElement.lang || navigator.language || "unknown",
      sectionSeen: new Set<string>(),
      sectionDwellMs: new Map<string, number>(),
      activeSectionId: null,
      activeSectionStartedAt: null,
      returnIntentTracked: false,
      ctaSeen: new Set<string>(),
      mediaProgressMilestones: new WeakMap<HTMLMediaElement, Set<number>>(),
      hadRuntimeError: false,
      errorRecovered: false,
      interactionPath: [],
      totalClicks: 0,
      accessibilityTracked: new Set<string>(),
    },
    baseData: {
      sessionId,
      anonymousId,
    },
  };

  track(context, "session_start", getContextSignals());
  track(context, "device_performance_class", {
    performanceClass: getDevicePerformanceClass(),
  });
  track(context, "referral_campaign_bucket", {
    bucket: getReferralCampaignBucket(),
  });
  trackPageView(context, "init");
  track(context, "network_change", {
    online: navigator.onLine,
    connectionType: getConnectionType(),
  });
  attachListeners(context);
}

export {
  trackContentInteraction,
  trackDemographics,
  trackExperimentExposure,
  trackFunnelStep,
} from "@/features/analytics/infrastructure/trackingCustomEvents";
