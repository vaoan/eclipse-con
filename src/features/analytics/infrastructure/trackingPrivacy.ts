import type {
  Primitive,
  TrackedEventName,
} from "@/features/analytics/infrastructure/trackingSchema";
import { EVENT_DATA_ALLOWLIST } from "@/features/analytics/infrastructure/trackingSchema";

const MAX_STRING_VALUE_LENGTH = 64;
const SAFE_TOKEN_PATTERN = /^[a-z0-9_.:/-]+$/i;
const SAFE_QUERY_KEY_PATTERN = /^[a-z0-9_-]+$/i;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const POSSIBLE_ID_SEGMENT_PATTERN = /^(?:\d{3,}|[a-z0-9]{16,})$/i;
const SENSITIVE_KEY_TOKENS = new Set([
  "name",
  "firstname",
  "lastname",
  "fullname",
  "email",
  "phone",
  "mobile",
  "address",
  "street",
  "city",
  "postal",
  "zip",
  "passport",
  "ssn",
  "dob",
  "birth",
  "message",
  "comment",
  "note",
  "notes",
  "description",
  "password",
  "token",
  "username",
  "handle",
  "userid",
  "userid",
  "user",
]);

function hasEmailShape(value: string): boolean {
  const atIndex = value.indexOf("@");
  if (atIndex <= 0 || atIndex === value.length - 1) {
    return false;
  }

  const domain = value.slice(atIndex + 1);
  return domain.includes(".");
}

function hasPhoneShape(value: string): boolean {
  let digitCount = 0;
  for (const character of value) {
    if (character >= "0" && character <= "9") {
      digitCount += 1;
      if (digitCount >= 7) {
        return true;
      }
    }
  }

  return false;
}

export function sanitizePath(pathname: string): string {
  const normalized = pathname.trim().replace(/\/{2,}/g, "/");
  if (!normalized) {
    return "/";
  }

  const segments = normalized
    .split("/")
    .filter(Boolean)
    .map((segment) => {
      const sanitizedSegment = segment.trim();
      if (!sanitizedSegment) {
        return null;
      }

      if (
        UUID_PATTERN.test(sanitizedSegment) ||
        POSSIBLE_ID_SEGMENT_PATTERN.test(sanitizedSegment)
      ) {
        return ":id";
      }

      return sanitizedSegment.replace(/[^a-z0-9._:-]/gi, "_").slice(0, 48);
    })
    .filter((segment): segment is string => Boolean(segment));

  return `/${segments.join("/")}`;
}

function sanitizeKey(key: string): string | null {
  const normalized = key
    .trim()
    .replace(/[^a-z0-9_-]/gi, "_")
    .toLowerCase();
  if (
    !normalized ||
    normalized.length > 48 ||
    !SAFE_QUERY_KEY_PATTERN.test(normalized)
  ) {
    return null;
  }

  return normalized;
}

function tokenizeKey(key: string): string[] {
  const normalized = key.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  return normalized
    .split("_")
    .map((token) => token.trim())
    .filter(Boolean);
}

function isSuspiciousKey(key: string): boolean {
  const tokens = tokenizeKey(key);
  return tokens.some((token) => SENSITIVE_KEY_TOKENS.has(token));
}

function sanitizeStringValue(rawValue: string): string | undefined {
  const value = rawValue.trim();
  if (!value || value.length > MAX_STRING_VALUE_LENGTH) {
    return undefined;
  }
  if (!SAFE_TOKEN_PATTERN.test(value)) {
    return undefined;
  }
  if (hasEmailShape(value) || hasPhoneShape(value)) {
    return undefined;
  }

  return value;
}

interface SanitizedPrimitiveResult {
  accepted: boolean;
  value: Primitive;
}

function sanitizePrimitiveValue(
  key: string,
  value: Primitive
): SanitizedPrimitiveResult {
  if (value === null || typeof value === "boolean") {
    return { accepted: true, value };
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value) || Math.abs(value) > 10_000_000) {
      return { accepted: false, value: null };
    }
    return { accepted: true, value };
  }

  if (isSuspiciousKey(key)) {
    return { accepted: false, value: null };
  }

  const sanitizedValue = sanitizeStringValue(value);
  if (sanitizedValue === undefined) {
    return { accepted: false, value: null };
  }

  return { accepted: true, value: sanitizedValue };
}

export function sanitizeEventData(
  name: TrackedEventName,
  data: Record<string, Primitive>,
  baseData: Record<string, Primitive>
): Record<string, Primitive> {
  const allowedKeys = new Set(EVENT_DATA_ALLOWLIST[name]);
  const sanitized: Record<string, Primitive> = { ...baseData };

  for (const [key, value] of Object.entries(data)) {
    if (!allowedKeys.has(key)) {
      continue;
    }

    const sanitizedValue = sanitizePrimitiveValue(key, value);
    if (sanitizedValue.accepted) {
      sanitized[key] = sanitizedValue.value;
    }
  }

  return sanitized;
}

export function getSanitizedQueryKeys(url: URL): string[] {
  const keys = new Set<string>();
  for (const key of url.searchParams.keys()) {
    const sanitizedKey = sanitizeKey(key);
    if (!sanitizedKey || isSuspiciousKey(sanitizedKey)) {
      continue;
    }

    keys.add(sanitizedKey);
  }

  return [...keys]
    .sort((left, right) => left.localeCompare(right))
    .slice(0, 32);
}
