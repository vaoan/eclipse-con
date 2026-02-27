import type { Primitive } from "@/shared/infrastructure/analytics/trackingSchema";

interface NavigatorWithConnection extends Navigator {
  connection?: {
    effectiveType?: string;
  };
}

function getUserAgent(): string {
  return navigator.userAgent.toLowerCase();
}

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

export function getContextSignals(): Record<string, Primitive> {
  return {
    deviceBucket: getDeviceBucket(),
    osFamily: getOsFamily(),
    browserFamily: getBrowserFamily(),
    referrerBucket: getReferrerBucket(),
    connectionType: getConnectionType(),
  };
}

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
