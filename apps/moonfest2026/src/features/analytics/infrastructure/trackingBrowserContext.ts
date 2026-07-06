import {
  getSanitizedQueryKeys,
  sanitizePath,
} from "@/features/analytics/infrastructure/trackingPrivacy";
import type { Primitive } from "@/features/analytics/infrastructure/trackingSchema";

const TRACKABLE_SELECTOR =
  "[data-track],button,a,input,select,textarea,[role],[aria-label]";

/** Returns the sanitized current URL pathname for use in analytics events. */
export function getPath(): string {
  const url = new URL(window.location.href);
  return sanitizePath(url.pathname);
}

/** Returns the sanitized query parameter key names present in the current URL. */
export function getQueryKeys(): string[] {
  const url = new URL(window.location.href);
  return getSanitizedQueryKeys(url);
}

/** Returns the current document language tag or the browser's navigator language. */
export function getLanguage(): string {
  return document.documentElement.lang || navigator.language || "unknown";
}

/** Buckets the current viewport width into `xs`, `sm`, `md`, or `lg`. */
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

/**
 * Extracts safe, non-PII element metadata from the closest trackable ancestor of the event target.
 * @returns An object with element tag, role, and other safe attributes, or `null` if no trackable element is found.
 */
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

/** Structured tracking signals read from `data-*` attributes on the clicked element or its ancestors. */
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

/**
 * Reads analytics data attributes from the closest annotated ancestor of the event target.
 * @returns A `DatasetSignals` object, or `null` if no annotated ancestor is found.
 */
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
