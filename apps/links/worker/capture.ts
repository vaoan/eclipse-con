import UAParser from "ua-parser-js";
import { classifyAgent } from "./agents";
import { bogotaDayHour } from "./time";

/** Longest free-text value stored (cities, org names, versions, …). */
const MAX_TEXT = 200;
/** Longest referrer stored (origin + path only, never the query). */
const MAX_REFERRER = 512;

/** The UTM parameters recorded per click. */
const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

/**
 * Columns written per click, in insert order. `human` and `is_first` are
 * derived in SQL by {@link recordClick}; `id` is assigned by SQLite.
 */
export const CLICK_COLUMNS = [
  "slug",
  "ts",
  "day",
  "hour",
  "country",
  "region",
  "city",
  "postal",
  "continent",
  "lat",
  "lon",
  "timezone",
  "colo",
  "asn",
  "as_org",
  "device",
  "os",
  "os_version",
  "browser",
  "browser_version",
  "device_vendor",
  "device_model",
  "referrer_host",
  "referrer",
  "lang",
  ...UTM_KEYS,
  "is_bot",
  "is_preview",
  "preview_app",
  "visitor_hash",
  "miss",
] as const;

/** One click as stored, keyed by {@link CLICK_COLUMNS}. */
export type ClickRow = Record<
  (typeof CLICK_COLUMNS)[number],
  string | number | null
>;

/** What the caller knows that the request does not. */
export interface CaptureOptions {
  /** Slug the click is attributed to (the requested one, for misses). */
  readonly slug: string;
  /** True when the slug is unknown or malformed. */
  readonly miss: boolean;
  /** Click time, ms since epoch. */
  readonly now: number;
  /** `VISITOR_HASH_KEY`; without it no unique-visitor hash is stored. */
  readonly hashKey: string | undefined;
}

/** Trim and cap a header/cf string; empty becomes null. */
function text(value: unknown, max = MAX_TEXT): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed.slice(0, max);
}

/** Parse a cf coordinate (sent as a string) to a number, else null. */
function coordinate(value: unknown): number | null {
  const parsed = typeof value === "string" ? Number.parseFloat(value) : NaN;
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * The visitor's primary language tag, normalised: `es-co,es;q=0.9` → `es-CO`.
 *
 * @param header - `Accept-Language` value.
 * @returns The first tag, or null.
 */
export function primaryLanguage(header: string | null): string | null {
  const first = header?.split(",")[0]?.split(";")[0]?.trim();
  if (!first || first === "*") {
    return null;
  }
  const [language = "", region] = first.split("-");
  return region
    ? `${language.toLowerCase()}-${region.toUpperCase()}`
    : language.toLowerCase();
}

/**
 * Referrer host and a query-free referrer (origin + path), so tokens or
 * personal data in the referring page's query string are never stored.
 *
 * @param header - `Referer` value.
 * @returns Host and trimmed referrer, both null when absent or unparseable.
 */
export function splitReferrer(header: string | null): {
  host: string | null;
  referrer: string | null;
} {
  if (!header) {
    return { host: null, referrer: null };
  }
  try {
    const url = new URL(header);
    return {
      host: url.hostname.replace(/^www\./, "") || null,
      referrer: `${url.origin}${url.pathname}`.slice(0, MAX_REFERRER),
    };
  } catch {
    return { host: null, referrer: null };
  }
}

/** Lowercase hex of a buffer. */
function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/** HMAC-SHA256 of `message` under `key`. */
async function hmac(
  key: ArrayBuffer | Uint8Array,
  message: string
): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    new TextEncoder().encode(message)
  );
}

/**
 * Daily-rotating visitor hash: HMAC(HMAC(secret, day), ip + user agent).
 * The same person gets the same hash all day and an unrelated one tomorrow,
 * so uniques can be counted per day without tracking anyone across days.
 *
 * @param secret - `VISITOR_HASH_KEY`.
 * @param day - Bogotá date `YYYY-MM-DD`.
 * @param ip - `CF-Connecting-IP`.
 * @param userAgent - `User-Agent`.
 * @returns 32 hex characters.
 */
export async function visitorHash(
  secret: string,
  day: string,
  ip: string,
  userAgent: string
): Promise<string> {
  const dayKey = await hmac(new TextEncoder().encode(secret), `day:${day}`);
  return toHex(await hmac(dayKey, `${ip}\n${userAgent}`)).slice(0, 32);
}

/** Device, OS and browser fields from a User-Agent. */
function parseAgent(userAgent: string, isBot: boolean) {
  const result = new UAParser(userAgent).getResult();
  return {
    device: isBot ? "bot" : (result.device.type ?? "desktop"),
    os: text(result.os.name),
    os_version: text(result.os.version),
    browser: text(result.browser.name),
    browser_version: text(result.browser.version?.split(".")[0]),
    device_vendor: text(result.device.vendor),
    device_model: text(result.device.model),
  };
}

/**
 * Builds the analytics row for one redirect. Reads only the request (geo from
 * `request.cf`, headers, query) — the raw IP is used for the hash and dropped.
 *
 * @param request - The incoming redirect request.
 * @param options - Slug, miss flag, clock and hash key.
 * @returns The row to insert.
 */
export async function buildClick(
  request: Request,
  options: CaptureOptions
): Promise<ClickRow> {
  const cf = (request as { cf?: IncomingRequestCfProperties }).cf;
  const headers = request.headers;
  const userAgent = headers.get("user-agent") ?? "";
  const agent = classifyAgent(userAgent);
  const { day, hour } = bogotaDayHour(options.now);
  const { host, referrer } = splitReferrer(headers.get("referer"));
  const query = new URL(request.url).searchParams;
  const ip = headers.get("cf-connecting-ip");
  const hash =
    options.hashKey && ip
      ? await visitorHash(options.hashKey, day, ip, userAgent)
      : null;

  const utm = Object.fromEntries(
    UTM_KEYS.map((key) => [key, text(query.get(key))])
  ) as Record<(typeof UTM_KEYS)[number], string | null>;

  return {
    slug: options.slug,
    ts: options.now,
    day,
    hour,
    country: text(cf?.country),
    region: text(cf?.region),
    city: text(cf?.city),
    postal: text(cf?.postalCode),
    continent: text(cf?.continent),
    lat: coordinate(cf?.latitude),
    lon: coordinate(cf?.longitude),
    timezone: text(cf?.timezone),
    colo: text(cf?.colo),
    asn: typeof cf?.asn === "number" ? cf.asn : null,
    as_org: text(cf?.asOrganization),
    ...parseAgent(userAgent, agent.isBot),
    referrer_host: host,
    referrer,
    lang: primaryLanguage(headers.get("accept-language")),
    ...utm,
    is_bot: agent.isBot ? 1 : 0,
    is_preview: agent.isPreview ? 1 : 0,
    preview_app: agent.previewApp,
    visitor_hash: hash,
    miss: options.miss ? 1 : 0,
  };
}

/**
 * Inserts a click. `human` and `is_first` are computed in the same statement:
 * a click is human unless it is a bot, a preview or a miss, and `is_first`
 * marks the visitor's first human click on this slug that day — which makes
 * unique visitors a plain SUM in every later aggregation.
 *
 * @param database - D1.
 * @param row - From {@link buildClick}.
 * @returns Resolves once written.
 */
export async function recordClick(
  database: D1Database,
  row: ClickRow
): Promise<void> {
  const human =
    row.is_bot === 0 && row.is_preview === 0 && row.miss === 0 ? 1 : 0;
  const placeholders = CLICK_COLUMNS.map(() => "?").join(", ");
  const sql = `INSERT INTO clicks (${CLICK_COLUMNS.join(", ")}, human, is_first)
    SELECT ${placeholders}, ?,
      CASE WHEN ? = 1 AND ? IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM clicks
        WHERE slug = ? AND visitor_hash = ? AND day = ? AND human = 1
      ) THEN 1 ELSE 0 END`;
  await database
    .prepare(sql)
    .bind(
      ...CLICK_COLUMNS.map((column) => row[column]),
      human,
      human,
      row.visitor_hash,
      row.slug,
      row.visitor_hash,
      row.day
    )
    .run();
}
