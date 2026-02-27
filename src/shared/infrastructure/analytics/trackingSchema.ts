export interface TrackingOptions {
  endpoint: string;
  enabled: boolean;
  debug: boolean;
}

export type Primitive = string | number | boolean | null;

export interface AnalyticsEvent {
  name: TrackedEventName;
  timestamp: number;
  path: string;
  queryKeys: string[];
  locale: string;
  viewport: string;
  data?: Record<string, Primitive>;
}

export const GENDER_OPTIONS = [
  "woman",
  "man",
  "non_binary",
  "prefer_not_to_say",
  "self_describe",
] as const;
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
export const ATTENDEE_TYPE_OPTIONS = ["new", "returning"] as const;
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

export interface DemographicsPayload {
  gender: GenderOption;
  ageRange: AgeRangeOption;
  attendeeType?: AttendeeTypeOption;
  regionBucket?: RegionBucketOption;
}

export type TrackedEventName =
  | "session_start"
  | "session_end"
  | "page_view"
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
  | "demographics_submitted";

export const EVENT_DATA_ALLOWLIST: Record<TrackedEventName, readonly string[]> = {
  session_start: [],
  session_end: [],
  page_view: ["trigger", "path"],
  scroll_depth: ["depth", "page"],
  click: ["tag", "role", "track", "ariaLabelPresent", "inputType"],
  rage_click: ["clickCount"],
  form_submit: ["fieldCount"],
  field_change: ["tag", "inputType", "checked"],
  visibility_change: ["state"],
  js_error: ["source", "line", "column"],
  unhandled_rejection: [],
  network_change: ["online"],
  performance_snapshot: [
    "domComplete",
    "loadEventEnd",
    "firstPaint",
    "firstContentfulPaint",
  ],
  demographics_submitted: ["gender", "ageRange", "attendeeType", "regionBucket"],
};

function isAllowedOption<T extends string>(
  value: string,
  options: readonly T[]
): value is T {
  return options.includes(value as T);
}

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
  if (!payload.ageRange || !isAllowedOption(payload.ageRange, AGE_RANGE_OPTIONS)) {
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

  return true;
}
