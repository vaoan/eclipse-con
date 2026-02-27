import {
  getSanitizedQueryKeys,
  sanitizePath,
} from "@/shared/infrastructure/analytics/trackingPrivacy";
import type { Primitive } from "@/shared/infrastructure/analytics/trackingSchema";

const TRACKABLE_SELECTOR =
  "[data-track],button,a,input,select,textarea,[role],[aria-label]";

export function getPath(): string {
  const url = new URL(window.location.href);
  return sanitizePath(url.pathname);
}

export function getQueryKeys(): string[] {
  const url = new URL(window.location.href);
  return getSanitizedQueryKeys(url);
}

export function getLanguage(): string {
  return document.documentElement.lang || navigator.language || "unknown";
}

export function getViewportBucket(): string {
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

export function getSafeElementData(
  target: EventTarget | null
): Record<string, Primitive> | null {
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

export interface DatasetSignals {
  funnelStep: string | null;
  ctaId: string | null;
  ctaVariant: string | null;
  contentSection: string | null;
  contentId: string | null;
  contentInteraction: string | null;
  experimentId: string | null;
  variantId: string | null;
}

export function getDatasetSignals(
  target: EventTarget | null
): DatasetSignals | null {
  if (!(target instanceof Element)) {
    return null;
  }

  const element = target.closest<HTMLElement>(
    [
      "[data-funnel-step]",
      "[data-content-id]",
      "[data-experiment-id]",
      "[data-variant-id]",
    ].join(",")
  );
  if (!element) {
    return null;
  }

  return {
    funnelStep: element.dataset.funnelStep ?? null,
    ctaId: element.dataset.ctaId ?? null,
    ctaVariant: element.dataset.ctaVariant ?? null,
    contentSection: element.dataset.contentSection ?? null,
    contentId: element.dataset.contentId ?? null,
    contentInteraction: element.dataset.contentInteraction ?? null,
    experimentId: element.dataset.experimentId ?? null,
    variantId: element.dataset.variantId ?? null,
  };
}
