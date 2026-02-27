import {
  isDemographicsPayload,
  type AnalyticsEvent,
  type DemographicsPayload,
  type Primitive,
  type TrackedEventName,
  type TrackingOptions,
} from "@/shared/infrastructure/analytics/trackingSchema";
import {
  getSanitizedQueryKeys,
  sanitizeEventData,
  sanitizePath,
} from "@/shared/infrastructure/analytics/trackingPrivacy";

const EVENT_QUEUE_LIMIT = 200;
const FLUSH_INTERVAL_MS = 5000;
const SESSION_KEY = "analytics_session_id";
const ANON_KEY = "analytics_anon_id";
const TRACKABLE_SELECTOR =
  "[data-track],button,a,input,select,textarea,[role],[aria-label]";
const ANALYTICS_ONLY_EVENTS = new Set<TrackedEventName>([
  "scroll_depth",
  "click",
  "rage_click",
  "form_submit",
  "field_change",
  "demographics_submitted",
]);

interface TrackingRuntimeState {
  queue: AnalyticsEvent[];
  maxScrollDepth: number;
  currentPage: string;
  clickTimes: number[];
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
    const randomSegment = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
      ""
    );
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

function getPath(): string {
  const url = new URL(window.location.href);
  return sanitizePath(url.pathname);
}

function getQueryKeys(): string[] {
  const url = new URL(window.location.href);
  return getSanitizedQueryKeys(url);
}

function getLanguage(): string {
  return document.documentElement.lang || navigator.language || "unknown";
}

function getViewportBucket(): string {
  const width = window.innerWidth;
  if (width < 640) {
    return "xs";
  }
  if (width < 1024) {
    return "sm";
  }
  if (width < 1440) {
    return "md";
  }
  return "lg";
}

function getSafeElementData(target: EventTarget | null): Record<string, Primitive> | null {
  if (!(target instanceof Element)) {
    return null;
  }

  const element = target.closest(TRACKABLE_SELECTOR);
  if (!(element instanceof HTMLElement)) {
    return null;
  }

  const inputType = element instanceof HTMLInputElement ? element.type : null;
  return {
    tag: element.tagName.toLowerCase(),
    role: element.getAttribute("role"),
    track: element.dataset.track ?? null,
    ariaLabelPresent: Boolean(element.getAttribute("aria-label")),
    inputType,
  };
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
  context.state.currentPage = path;
  context.state.maxScrollDepth = 0;
  track(context, "page_view", { trigger, path });
}

function patchHistoryNavigationEvent(): void {
  const dispatchNavigationEvent = () => {
    window.dispatchEvent(new Event("analytics:navigation"));
  };

  const historyPushState = window.history.pushState.bind(window.history);
  const historyReplaceState = window.history.replaceState.bind(window.history);

  window.history.pushState = (...args: Parameters<History["pushState"]>) => {
    historyPushState(...args);
    dispatchNavigationEvent();
  };

  window.history.replaceState = (...args: Parameters<History["replaceState"]>) => {
    historyReplaceState(...args);
    dispatchNavigationEvent();
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
    const elementData = getSafeElementData(event.target);
    if (elementData) {
      track(context, "click", elementData);
    }

    const now = Date.now();
    context.state.clickTimes = context.state.clickTimes.filter((time) => now - time < 1000);
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
  };
}

function createOnFormSubmit(context: TrackContext): (event: Event) => void {
  return (event) => {
    const form = event.target instanceof HTMLFormElement ? event.target : null;
    const fieldCount = form ? form.querySelectorAll("input,select,textarea").length : 0;
    track(context, "form_submit", { fieldCount });
  };
}

function createOnVisibilityChange(context: TrackContext): () => void {
  return () => {
    track(context, "visibility_change", { state: document.visibilityState });
    if (document.visibilityState === "hidden") {
      flush(context, true);
    }
  };
}

function createOnError(context: TrackContext): (event: ErrorEvent) => void {
  return (event) => {
    const source = event.filename
      ? (() => {
          const segments = event.filename.split("/");
          return segments.length > 0 ? segments[segments.length - 1] : null;
        })()
      : null;
    track(context, "js_error", {
      source,
      line: event.lineno || null,
      column: event.colno || null,
    });
  };
}

function createOnDemographics(context: TrackContext): (event: Event) => void {
  return (event) => {
    if (!(event instanceof CustomEvent)) {
      return;
    }

    const detail: unknown = event.detail;
    if (!isDemographicsPayload(detail)) {
      return;
    }

    track(context, "demographics_submitted", {
      gender: detail.gender,
      ageRange: detail.ageRange,
      attendeeType: detail.attendeeType ?? null,
      regionBucket: detail.regionBucket ?? null,
    });
  };
}

function recordPerformanceSnapshot(context: TrackContext): void {
  const navigationEntry = performance.getEntriesByType("navigation")[0];
  const navigation = navigationEntry as PerformanceNavigationTiming | undefined;
  const paintEntries = performance.getEntriesByType("paint");
  const firstPaint = paintEntries.find((entry) => entry.name === "first-paint");
  const firstContentfulPaint = paintEntries.find(
    (entry) => entry.name === "first-contentful-paint"
  );

  track(context, "performance_snapshot", {
    domComplete: navigation ? Math.round(navigation.domComplete) : null,
    loadEventEnd: navigation ? Math.round(navigation.loadEventEnd) : null,
    firstPaint: firstPaint ? Math.round(firstPaint.startTime) : null,
    firstContentfulPaint: firstContentfulPaint
      ? Math.round(firstContentfulPaint.startTime)
      : null,
  });
}

function attachListeners(context: TrackContext): void {
  document.addEventListener("click", createOnClick(context), true);
  document.addEventListener("submit", createOnFormSubmit(context), true);
  document.addEventListener("change", createOnFieldChange(context), true);
  document.addEventListener("visibilitychange", createOnVisibilityChange(context));
  window.addEventListener("error", createOnError(context));
  window.addEventListener("unhandledrejection", () => {
    track(context, "unhandled_rejection");
  });
  window.addEventListener("online", () => {
    track(context, "network_change", { online: navigator.onLine });
  });
  window.addEventListener("offline", () => {
    track(context, "network_change", { online: navigator.onLine });
  });
  window.addEventListener("beforeunload", () => {
    track(context, "session_end");
    flush(context, true);
  });
  window.addEventListener("analytics:navigation", () => {
    trackPageView(context, "history_change");
  });
  window.addEventListener("analytics:demographics", createOnDemographics(context));
  window.addEventListener("popstate", () => {
    trackPageView(context, "history_change");
  });
  window.addEventListener("scroll", createOnScroll(context), { passive: true });
  window.setTimeout(() => {
    recordPerformanceSnapshot(context);
  }, 0);
  window.setInterval(() => {
    flush(context, false);
  }, FLUSH_INTERVAL_MS);
}

export function trackDemographics(payload: DemographicsPayload): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<DemographicsPayload>("analytics:demographics", {
      detail: payload,
    })
  );
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
    },
    baseData: {
      sessionId,
      anonymousId,
    },
  };

  track(context, "session_start");
  trackPageView(context, "init");
  attachListeners(context);
}
