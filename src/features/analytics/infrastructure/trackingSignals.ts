import type { Primitive } from "@/features/analytics/infrastructure/trackingSchema";

interface NavigatorWithConnection extends Navigator {
  connection?: {
    effectiveType?: string;
  };
}

function getUserAgent(): string {
  return navigator.userAgent.toLowerCase();
}

/** Buckets the viewport width into `"mobile"`, `"tablet"`, or `"desktop"`. */
export function getDeviceBucket(): string {
  const width = window.innerWidth;
  if (width < 768) {
    return "mobile";
  }
  if (width < 1024) {
    return "tablet";
  }
  return "desktop";
}

/** Returns a coarse OS family string (`"windows"`, `"macos"`, `"android"`, `"ios"`, `"linux"`, or `"other"`). */
export function getOsFamily(): string {
  const ua = getUserAgent();
  if (ua.includes("windows")) {
    return "windows";
  }
  if (ua.includes("mac os") || ua.includes("macintosh")) {
    return "macos";
  }
  if (ua.includes("android")) {
    return "android";
  }
  if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ios")) {
    return "ios";
  }
  if (ua.includes("linux")) {
    return "linux";
  }
  return "other";
}

/** Returns a coarse browser family string (`"edge"`, `"firefox"`, `"safari"`, `"chrome"`, or `"other"`). */
export function getBrowserFamily(): string {
  const ua = getUserAgent();
  if (ua.includes("edg/")) {
    return "edge";
  }
  if (ua.includes("firefox/")) {
    return "firefox";
  }
  if (ua.includes("safari/") && !ua.includes("chrome/")) {
    return "safari";
  }
  if (ua.includes("chrome/")) {
    return "chrome";
  }
  return "other";
}

/** Classifies the document referrer as `"direct"`, `"internal"`, `"search"`, `"social"`, or `"campaign"`. */
export function getReferrerBucket(): string {
  const referrer = document.referrer;
  if (!referrer) {
    return "direct";
  }

  try {
    const url = new URL(referrer);
    if (url.hostname === window.location.hostname) {
      return "internal";
    }
    if (
      url.hostname.includes("google.") ||
      url.hostname.includes("bing.") ||
      url.hostname.includes("duckduckgo.")
    ) {
      return "search";
    }
    if (
      url.hostname.includes("facebook.") ||
      url.hostname.includes("instagram.") ||
      url.hostname.includes("t.co") ||
      url.hostname.includes("x.com")
    ) {
      return "social";
    }
    return "campaign";
  } catch {
    return "campaign";
  }
}

/** Returns the effective connection type as `"2g"`, `"3g"`, `"4g"`, or `"unknown"` via the Network Information API. */
export function getConnectionType(): string {
  const typedNavigator = navigator as NavigatorWithConnection;
  const connectionType = typedNavigator.connection?.effectiveType;
  if (!connectionType) {
    return "unknown";
  }
  if (connectionType === "slow-2g" || connectionType === "2g") {
    return "2g";
  }
  if (connectionType === "3g") {
    return "3g";
  }
  if (connectionType === "4g") {
    return "4g";
  }
  return "unknown";
}

/** Classifies the device as `"low"`, `"medium"`, or `"high"` performance based on memory and CPU cores. */
export function getDevicePerformanceClass(): string {
  const typedNavigator = navigator as Navigator & {
    deviceMemory?: number;
    hardwareConcurrency?: number;
  };
  const memory = typedNavigator.deviceMemory ?? 4;
  const cores = navigator.hardwareConcurrency;
  if (memory <= 2 || cores <= 2) {
    return "low";
  }
  if (memory >= 8 && cores >= 8) {
    return "high";
  }
  return "medium";
}

/** Checks the current URL for UTM or ad click ID parameters and returns `"utm_present"`, `"ad_click_id"`, or `"none"`. */
export function getReferralCampaignBucket(): string {
  const params = new URL(window.location.href).searchParams;
  const hasUtm =
    params.has("utm_source") ||
    params.has("utm_medium") ||
    params.has("utm_campaign");
  if (hasUtm) {
    return "utm_present";
  }
  if (params.has("gclid") || params.has("fbclid") || params.has("msclkid")) {
    return "ad_click_id";
  }
  return "none";
}

function getPrimaryLanguageTag(locale: string): string | null {
  const normalized = locale.trim().toLowerCase().replace("_", "-");
  if (!normalized) {
    return null;
  }

  const primaryTag = normalized.split("-")[0];
  if (!primaryTag || !/^[a-z]{2,3}$/.test(primaryTag)) {
    return null;
  }

  return primaryTag;
}

/** Returns the primary BCP 47 language tag from the browser's language preferences, or `"unknown"`. */
export function getBrowserLanguagePreference(): string {
  const languageCandidates = [...navigator.languages, navigator.language];

  for (const candidate of languageCandidates) {
    const primaryTag = getPrimaryLanguageTag(candidate);
    if (primaryTag) {
      return primaryTag;
    }
  }

  return "unknown";
}

/** Collects all browser context signals (device, OS, browser, referrer, connection, language) into a single record. */
export function getContextSignals(): Record<string, Primitive> {
  return {
    deviceBucket: getDeviceBucket(),
    osFamily: getOsFamily(),
    browserFamily: getBrowserFamily(),
    referrerBucket: getReferrerBucket(),
    connectionType: getConnectionType(),
    browserLanguage: getBrowserLanguagePreference(),
  };
}

/** Buckets a session duration in milliseconds into `"lt_30s"`, `"30s_120s"`, `"2m_10m"`, or `"10m_plus"`. */
export function getDurationBucket(milliseconds: number): string {
  if (milliseconds < 30_000) {
    return "lt_30s";
  }
  if (milliseconds < 120_000) {
    return "30s_120s";
  }
  if (milliseconds < 600_000) {
    return "2m_10m";
  }
  return "10m_plus";
}

/** Buckets a page-views-per-session count into `"1"`, `"2_3"`, `"4_5"`, or `"6_plus"`. */
export function getPagesPerSessionBucket(pages: number): string {
  if (pages <= 1) {
    return "1";
  }
  if (pages <= 3) {
    return "2_3";
  }
  if (pages <= 5) {
    return "4_5";
  }
  return "6_plus";
}

function getLargestContentfulPaint(): number | null {
  const lcpEntries = performance.getEntriesByType("largest-contentful-paint");
  if (lcpEntries.length === 0) {
    return null;
  }

  return lcpEntries[lcpEntries.length - 1]?.startTime ?? null;
}

function getCumulativeLayoutShift(): number {
  let cumulativeLayoutShift = 0;
  const clsEntries = performance.getEntriesByType("layout-shift");
  for (const entry of clsEntries) {
    const layoutShift = entry as PerformanceEntry & {
      value?: number;
      hadRecentInput?: boolean;
    };
    if (!layoutShift.hadRecentInput && typeof layoutShift.value === "number") {
      cumulativeLayoutShift += layoutShift.value;
    }
  }

  return cumulativeLayoutShift;
}

function getInteractionToNextPaint(): number | null {
  const interactionEntries = performance.getEntriesByType("event");
  let interactionToNextPaint: number | null = null;
  for (const entry of interactionEntries) {
    const interaction = entry as PerformanceEntry & { duration?: number };
    if (typeof interaction.duration === "number") {
      interactionToNextPaint = Math.max(
        interactionToNextPaint ?? 0,
        interaction.duration
      );
    }
  }

  return interactionToNextPaint;
}

function getLcpBucket(value: number | null): string | null {
  if (value === null) {
    return null;
  }
  if (value <= 2500) {
    return "good";
  }
  if (value <= 4000) {
    return "needs_improvement";
  }
  return "poor";
}

function getClsBucket(value: number): string {
  if (value <= 0.1) {
    return "good";
  }
  if (value <= 0.25) {
    return "needs_improvement";
  }
  return "poor";
}

function getInpBucket(value: number | null): string | null {
  if (value === null) {
    return null;
  }
  if (value <= 200) {
    return "good";
  }
  if (value <= 500) {
    return "needs_improvement";
  }
  return "poor";
}

/** Collects Web Vitals (LCP, CLS, INP, FP, FCP) from the Performance API and returns them as bucketed values. */
export function getWebVitalBuckets(): Record<string, Primitive> {
  const entries = performance.getEntriesByType("navigation");
  const navigation = entries[0] as PerformanceNavigationTiming | undefined;
  const paints = performance.getEntriesByType("paint");
  const firstPaint = paints.find((entry) => entry.name === "first-paint");
  const firstContentfulPaint = paints.find(
    (entry) => entry.name === "first-contentful-paint"
  );
  const largestContentfulPaint = getLargestContentfulPaint();
  const cumulativeLayoutShift = getCumulativeLayoutShift();
  const interactionToNextPaint = getInteractionToNextPaint();
  const lcpBucket = getLcpBucket(largestContentfulPaint);
  const clsBucket = getClsBucket(cumulativeLayoutShift);
  const inpBucket = getInpBucket(interactionToNextPaint);

  return {
    domComplete: navigation ? Math.round(navigation.domComplete) : null,
    loadEventEnd: navigation ? Math.round(navigation.loadEventEnd) : null,
    firstPaint: firstPaint ? Math.round(firstPaint.startTime) : null,
    firstContentfulPaint: firstContentfulPaint
      ? Math.round(firstContentfulPaint.startTime)
      : null,
    largestContentfulPaintBucket: lcpBucket,
    cumulativeLayoutShiftBucket: clsBucket,
    interactionToNextPaintBucket: inpBucket,
  };
}
