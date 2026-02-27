export function getFirstInteractionBucket(milliseconds: number): string {
  if (milliseconds < 1000) {
    return "lt_1s";
  }
  if (milliseconds < 3000) {
    return "1s_3s";
  }
  if (milliseconds < 10_000) {
    return "3s_10s";
  }
  return "10s_plus";
}

export function getQueryLengthBucket(length: number): string {
  if (length <= 0) {
    return "0";
  }
  if (length <= 3) {
    return "1_3";
  }
  if (length <= 8) {
    return "4_8";
  }
  return "9_plus";
}

export function getResultCountBucket(count: number | null): string | null {
  if (count === null || Number.isNaN(count)) {
    return null;
  }
  if (count <= 0) {
    return "0";
  }
  if (count <= 3) {
    return "1_3";
  }
  if (count <= 10) {
    return "4_10";
  }
  return "11_plus";
}

export function getDurationBucketFromMs(milliseconds: number): string {
  if (milliseconds < 5_000) {
    return "lt_5s";
  }
  if (milliseconds < 30_000) {
    return "5s_30s";
  }
  if (milliseconds < 120_000) {
    return "30s_120s";
  }
  if (milliseconds < 600_000) {
    return "2m_10m";
  }
  return "10m_plus";
}

export function getReservationLeadTimeBucket(daysUntilEvent: number): string {
  if (daysUntilEvent < 0) {
    return "past";
  }
  if (daysUntilEvent <= 7) {
    return "0_7_days";
  }
  if (daysUntilEvent <= 30) {
    return "8_30_days";
  }
  if (daysUntilEvent <= 90) {
    return "31_90_days";
  }
  return "90_plus_days";
}

export function getSectionIdFromTarget(
  target: EventTarget | null
): string | null {
  if (!(target instanceof Element)) {
    return null;
  }

  const section = target.closest("section[id]");
  if (!section) {
    return null;
  }

  return section.id || null;
}

export function getCtaPositionBucket(
  target: EventTarget | null
): string | null {
  if (!(target instanceof Element)) {
    return null;
  }

  const element = target.closest<HTMLElement>("a,button");
  if (!element) {
    return null;
  }

  const viewportHeight = window.innerHeight || 1;
  const y = element.getBoundingClientRect().top;
  const ratio = y / viewportHeight;
  if (ratio < 0.33) {
    return "top";
  }
  if (ratio < 0.67) {
    return "middle";
  }
  return "bottom";
}

export function getOutboundDomainBucket(
  target: EventTarget | null
): string | null {
  if (!(target instanceof Element)) {
    return null;
  }

  const anchor = target.closest<HTMLAnchorElement>("a[href]");
  if (!anchor) {
    return null;
  }

  try {
    const url = new URL(anchor.href, window.location.origin);
    if (url.hostname === window.location.hostname) {
      return null;
    }
    const parts = url.hostname.split(".").filter(Boolean);
    if (parts.length < 2) {
      return url.hostname;
    }
    return `${parts[parts.length - 2]}.${parts[parts.length - 1]}`;
  } catch {
    return null;
  }
}

export function getMenuActionFromTarget(
  target: EventTarget | null
): string | null {
  if (!(target instanceof Element)) {
    return null;
  }

  const actionElement = target.closest<HTMLElement>("[data-nav-menu-action]");
  return actionElement?.dataset.navMenuAction ?? null;
}

export function getFaqActionFromTarget(target: EventTarget | null): {
  faqId: string;
  action: "open" | "close";
} | null {
  if (!(target instanceof Element)) {
    return null;
  }

  const trigger = target.closest<HTMLElement>("[data-faq-id]");
  if (!trigger) {
    return null;
  }

  const faqId = trigger.dataset.faqId;
  if (!faqId) {
    return null;
  }
  const isExpanded = trigger.getAttribute("aria-expanded") === "true";
  return {
    faqId,
    action: isExpanded ? "close" : "open",
  };
}

export function getNewsActionFromTarget(target: EventTarget | null): {
  action: string;
  itemId: string | null;
} | null {
  if (!(target instanceof Element)) {
    return null;
  }

  const actionElement = target.closest<HTMLElement>("[data-news-action]");
  if (!actionElement) {
    return null;
  }

  return {
    action: actionElement.dataset.newsAction ?? "unknown",
    itemId: actionElement.dataset.newsItemId ?? null,
  };
}

export function getFaqBlockerThemeFromTarget(target: EventTarget | null): {
  faqId: string;
  theme: string;
} | null {
  if (!(target instanceof Element)) {
    return null;
  }

  const trigger = target.closest<HTMLElement>("[data-faq-id]");
  if (!trigger?.dataset.faqTheme) {
    return null;
  }

  const faqId = trigger.dataset.faqId;
  if (!faqId) {
    return null;
  }

  // Only fire on open (when aria-expanded is currently false → clicking to open)
  const isExpanded = trigger.getAttribute("aria-expanded") === "true";
  if (isExpanded) {
    return null;
  }

  return { faqId, theme: trigger.dataset.faqTheme };
}

export function getFormErrorType(target: EventTarget | null): {
  errorType: string;
  fieldType: string;
} | null {
  if (
    !(target instanceof HTMLInputElement) &&
    !(target instanceof HTMLSelectElement) &&
    !(target instanceof HTMLTextAreaElement)
  ) {
    return null;
  }

  const validity = target.validity;
  let errorType = "invalid";
  if (validity.valueMissing) {
    errorType = "required";
  } else if (validity.typeMismatch || validity.patternMismatch) {
    errorType = "format";
  } else if (validity.rangeOverflow || validity.rangeUnderflow) {
    errorType = "range";
  } else if (validity.tooLong || validity.tooShort) {
    errorType = "length";
  }

  const fieldType =
    target instanceof HTMLInputElement
      ? target.type
      : target.tagName.toLowerCase();
  return {
    errorType,
    fieldType,
  };
}
