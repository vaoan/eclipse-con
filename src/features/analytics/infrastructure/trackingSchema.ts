/** Configuration options for initializing the extreme tracking system. */
export interface TrackingOptions {
  endpoint: string;
  enabled: boolean;
  debug: boolean;
  posthogApiKey: string;
  posthogHost: string;
}

/** Scalar value type used throughout the analytics event payload maps. */
export type Primitive = string | number | boolean | null;

/** Represents a single analytics event ready to be sent to the backend. */
export interface AnalyticsEvent {
  name: TrackedEventName;
  timestamp: number;
  path: string;
  queryKeys: string[];
  locale: string;
  viewport: string;
  data?: Record<string, Primitive>;
}

/** Allowed gender identity options for the demographics survey. */
export const GENDER_OPTIONS = [
  "woman",
  "man",
  "non_binary",
  "prefer_not_to_say",
  "self_describe",
] as const;
/** Allowed age range options for the demographics survey. */
export const AGE_RANGE_OPTIONS = [
  "13_17",
  "18_24",
  "25_34",
  "35_44",
  "45_54",
  "55_64",
  "65_plus",
  "prefer_not_to_say",
] as const;
/** Whether the respondent is a new or returning attendee. */
export const ATTENDEE_TYPE_OPTIONS = ["new", "returning"] as const;
/** Broad geographic region options for the demographics survey. */
export const REGION_BUCKET_OPTIONS = [
  "north_america",
  "south_america",
  "europe",
  "asia",
  "africa",
  "oceania",
  "other",
  "prefer_not_to_say",
] as const;

export type GenderOption = (typeof GENDER_OPTIONS)[number];
export type AgeRangeOption = (typeof AGE_RANGE_OPTIONS)[number];
export type AttendeeTypeOption = (typeof ATTENDEE_TYPE_OPTIONS)[number];
export type RegionBucketOption = (typeof REGION_BUCKET_OPTIONS)[number];

/** Payload for the demographics survey submission event. */
export interface DemographicsPayload {
  gender: GenderOption;
  ageRange: AgeRangeOption;
  attendeeType?: AttendeeTypeOption;
  regionBucket?: RegionBucketOption;
  country?: string;
}

/** Payload for a user interaction with a specific piece of content in a section. */
export interface ContentInteractionPayload {
  sectionId: string;
  contentId: string;
  interactionType:
    | "view"
    | "open"
    | "close"
    | "play"
    | "pause"
    | "expand"
    | "collapse"
    | "download"
    | "enable"
    | "disable";
}

/** Payload for a registration conversion funnel step event. */
export interface FunnelStepPayload {
  step:
    | "view_pricing"
    | "click_reserve"
    | "start_checkout"
    | "complete_checkout";
  ctaId?: string;
  ctaVariant?: string;
}

/** Payload for recording that a user was exposed to an A/B experiment variant. */
export interface ExperimentExposurePayload {
  experimentId: string;
  variantId: string;
}

/** Payload for recording the user's tracking consent decision. */
export interface ConsentPreferencePayload {
  source: "accept_all" | "reject_optional";
  analytics: boolean;
  updatedAt: string;
}

/** Union of all valid analytics event name strings. */
export type TrackedEventName =
  | "session_start"
  | "session_end"
  | "page_view"
  | "section_impression"
  | "outbound_link_click"
  | "page_load_failure"
  | "media_load_health"
  | "copy_interaction"
  | "search_interaction"
  | "dwell_time_per_section"
  | "return_intent"
  | "cta_visibility"
  | "nav_path_cluster"
  | "form_error_type"
  | "media_watch_progress"
  | "network_quality_impact"
  | "device_performance_class"
  | "engagement_score_bucket"
  | "referral_campaign_bucket"
  | "accessibility_usage"
  | "error_recovery"
  | "reservation_lead_time_bucket"
  | "locale_switch"
  | "navigation_menu_usage"
  | "time_to_first_interaction"
  | "scroll_depth"
  | "click"
  | "rage_click"
  | "form_submit"
  | "field_change"
  | "visibility_change"
  | "js_error"
  | "unhandled_rejection"
  | "network_change"
  | "performance_snapshot"
  | "demographics_submitted"
  | "navigation_transition"
  | "cta_interaction"
  | "faq_interaction"
  | "news_engagement"
  | "content_interaction"
  | "funnel_step"
  | "experiment_exposure"
  | "consent_preference_updated"
  | "registration_tutorial_step_selected"
  | "registration_tutorial_step_toggled"
  | "registration_tutorial_progress_bucket"
  | "faq_blocker_theme"
  | "reserve_ticket_handoff";

/** Per-event allowlist of data property keys that may be included in analytics payloads. */
export const EVENT_DATA_ALLOWLIST: Record<TrackedEventName, readonly string[]> =
  {
    session_start: [
      "deviceBucket",
      "osFamily",
      "browserFamily",
      "referrerBucket",
      "connectionType",
      "browserLanguage",
    ],
    session_end: [
      "durationBucket",
      "pagesPerSessionBucket",
      "activeTimeBucket",
    ],
    page_view: [
      "trigger",
      "path",
      "deviceBucket",
      "osFamily",
      "browserFamily",
      "referrerBucket",
      "connectionType",
      "browserLanguage",
    ],
    section_impression: ["sectionId"],
    outbound_link_click: ["domainBucket"],
    page_load_failure: ["resourceType"],
    media_load_health: ["mediaType", "status"],
    copy_interaction: ["sourceId"],
    search_interaction: ["queryLengthBucket", "resultCountBucket", "sourceId"],
    dwell_time_per_section: ["sectionId", "durationBucket"],
    return_intent: ["action"],
    cta_visibility: ["ctaId", "ctaVariant", "sectionId"],
    nav_path_cluster: ["cluster"],
    form_error_type: ["errorType", "fieldType"],
    media_watch_progress: ["mediaType", "progress"],
    network_quality_impact: ["step", "connectionType"],
    device_performance_class: ["performanceClass"],
    engagement_score_bucket: ["bucket"],
    referral_campaign_bucket: ["bucket"],
    accessibility_usage: ["mode"],
    error_recovery: ["status"],
    reservation_lead_time_bucket: ["bucket"],
    locale_switch: ["toLocale"],
    navigation_menu_usage: ["action"],
    time_to_first_interaction: ["bucket"],
    scroll_depth: ["depth", "page"],
    click: ["tag", "role", "track", "ariaLabelPresent", "inputType"],
    rage_click: ["clickCount"],
    form_submit: ["fieldCount"],
    field_change: ["tag", "inputType", "checked"],
    visibility_change: ["state"],
    js_error: ["source", "line", "column"],
    unhandled_rejection: [],
    network_change: ["online", "connectionType"],
    performance_snapshot: [
      "domComplete",
      "loadEventEnd",
      "firstPaint",
      "firstContentfulPaint",
      "largestContentfulPaintBucket",
      "cumulativeLayoutShiftBucket",
      "interactionToNextPaintBucket",
    ],
    demographics_submitted: [
      "gender",
      "ageRange",
      "attendeeType",
      "regionBucket",
      "country",
    ],
    navigation_transition: ["fromPath", "toPath"],
    cta_interaction: ["ctaId", "ctaVariant", "ctaPosition", "sectionId"],
    faq_interaction: ["faqId", "action"],
    news_engagement: ["action", "layoutMode", "itemId"],
    content_interaction: ["sectionId", "contentId", "interactionType"],
    funnel_step: ["step", "ctaId", "ctaVariant"],
    experiment_exposure: ["experimentId", "variantId"],
    consent_preference_updated: ["source", "analytics", "updatedAt"],
    registration_tutorial_step_selected: ["stepNumber", "origin"],
    registration_tutorial_step_toggled: ["stepNumber", "nextState"],
    registration_tutorial_progress_bucket: ["bucket", "activeStep"],
    faq_blocker_theme: ["faqId", "theme"],
    reserve_ticket_handoff: ["sourceSurface", "targetAction"],
  };

function isIsoCountryCode(value: string): boolean {
  return /^[A-Z]{2}$/.test(value);
}

function isAllowedOption<T extends string>(
  value: string,
  options: readonly T[]
): value is T {
  return options.includes(value as T);
}

/** Type guard that validates an unknown value as a `DemographicsPayload`. */
export function isDemographicsPayload(
  value: unknown
): value is DemographicsPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Partial<DemographicsPayload>;
  if (!payload.gender || !isAllowedOption(payload.gender, GENDER_OPTIONS)) {
    return false;
  }
  if (
    !payload.ageRange ||
    !isAllowedOption(payload.ageRange, AGE_RANGE_OPTIONS)
  ) {
    return false;
  }
  if (
    payload.attendeeType &&
    !isAllowedOption(payload.attendeeType, ATTENDEE_TYPE_OPTIONS)
  ) {
    return false;
  }
  if (
    payload.regionBucket &&
    !isAllowedOption(payload.regionBucket, REGION_BUCKET_OPTIONS)
  ) {
    return false;
  }
  if (
    payload.country &&
    (!/^[a-z]{2}$/i.test(payload.country) ||
      !isIsoCountryCode(payload.country.toUpperCase()))
  ) {
    return false;
  }

  return true;
}

function isSafeId(value: string): boolean {
  return /^[a-z0-9._:-]{1,64}$/i.test(value);
}

/** Type guard that validates an unknown value as a `ContentInteractionPayload`. */
export function isContentInteractionPayload(
  value: unknown
): value is ContentInteractionPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Partial<ContentInteractionPayload>;
  const allowedInteractions = new Set<
    ContentInteractionPayload["interactionType"]
  >([
    "view",
    "open",
    "close",
    "play",
    "pause",
    "expand",
    "collapse",
    "download",
    "enable",
    "disable",
  ]);
  if (!payload.sectionId || !isSafeId(payload.sectionId)) {
    return false;
  }
  if (!payload.contentId || !isSafeId(payload.contentId)) {
    return false;
  }
  if (
    !payload.interactionType ||
    !allowedInteractions.has(payload.interactionType)
  ) {
    return false;
  }

  return true;
}

/** Type guard that validates an unknown value as a `FunnelStepPayload`. */
export function isFunnelStepPayload(
  value: unknown
): value is FunnelStepPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Partial<FunnelStepPayload>;
  const allowedSteps = new Set<FunnelStepPayload["step"]>([
    "view_pricing",
    "click_reserve",
    "start_checkout",
    "complete_checkout",
  ]);
  if (!payload.step || !allowedSteps.has(payload.step)) {
    return false;
  }
  if (payload.ctaId && !isSafeId(payload.ctaId)) {
    return false;
  }
  if (payload.ctaVariant && !isSafeId(payload.ctaVariant)) {
    return false;
  }

  return true;
}

/** Type guard that validates an unknown value as an `ExperimentExposurePayload`. */
export function isExperimentExposurePayload(
  value: unknown
): value is ExperimentExposurePayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Partial<ExperimentExposurePayload>;
  if (!payload.experimentId || !isSafeId(payload.experimentId)) {
    return false;
  }
  if (!payload.variantId || !isSafeId(payload.variantId)) {
    return false;
  }

  return true;
}

/** Type guard that validates an unknown value as a `ConsentPreferencePayload`. */
export function isConsentPreferencePayload(
  value: unknown
): value is ConsentPreferencePayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Partial<ConsentPreferencePayload>;
  const sourceAllowed = new Set<ConsentPreferencePayload["source"]>([
    "accept_all",
    "reject_optional",
  ]);
  if (!payload.source || !sourceAllowed.has(payload.source)) {
    return false;
  }
  if (typeof payload.analytics !== "boolean") {
    return false;
  }
  if (
    typeof payload.updatedAt !== "string" ||
    Number.isNaN(Date.parse(payload.updatedAt))
  ) {
    return false;
  }

  return true;
}
