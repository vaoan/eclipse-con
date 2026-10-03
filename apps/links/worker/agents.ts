/**
 * Link-preview fetchers: an app fetching the page to draw a card because
 * someone pasted the link into it. Reported as "shared on", not as visits.
 * Order matters — the first match wins (iMessage poses as Facebook+Twitter).
 */
const PREVIEW_APPS: readonly (readonly [RegExp, string])[] = [
  [/WhatsApp/i, "whatsapp"],
  [/TelegramBot/i, "telegram"],
  [/Discordbot/i, "discord"],
  [/Slackbot/i, "slack"],
  [/facebookexternalhit\/1\.1 Facebot Twitterbot/i, "imessage"],
  [/facebookexternalhit|Facebot|meta-externalagent/i, "facebook"],
  [/Twitterbot/i, "x"],
  [/LinkedInBot/i, "linkedin"],
  [/SkypeUriPreview/i, "skype"],
  [/Pinterestbot/i, "pinterest"],
  [/redditbot/i, "reddit"],
  [/Viber/i, "viber"],
  [/Snapchat/i, "snapchat"],
  [/Google-PageRenderer|GoogleDocs/i, "google"],
  [/Iframely|Embedly/i, "embed"],
];

/**
 * Crawlers, monitors, scripts and headless browsers, as several small
 * patterns (plain alternations, no nested quantifiers, so no backtracking
 * risk). `\bbot\b` spares phone brands like "CUBOT".
 */
const BOT_PATTERNS: readonly RegExp[] = [
  /\bbot\b|bot\//i,
  /crawl|spider|slurp|scrapy/i,
  /curl\/|wget|python-requests|python-urllib|aiohttp|httpx/i,
  /go-http-client|okhttp|java\/|libwww|axios\/|node-fetch|undici/i,
  /headless|phantomjs|lighthouse/i,
  /pingdom|uptime|monitor|statuscake|checkly|datadog|newrelic|preview/i,
];

/** How a User-Agent is classified. */
export interface AgentKind {
  /** A crawler, script or monitor. */
  readonly isBot: boolean;
  /** A link-preview fetcher. */
  readonly isPreview: boolean;
  /** Which app fetched the preview (`whatsapp`, `telegram`, …), else null. */
  readonly previewApp: string | null;
}

/**
 * Classifies a User-Agent as human, bot or link-preview fetcher. Previews are
 * checked first: most preview fetchers would also match the bot pattern.
 *
 * @param userAgent - The `User-Agent` header ("" when absent).
 * @returns The classification.
 */
export function classifyAgent(userAgent: string): AgentKind {
  for (const [pattern, app] of PREVIEW_APPS) {
    if (pattern.test(userAgent)) {
      return { isBot: false, isPreview: true, previewApp: app };
    }
  }
  const isBot =
    userAgent.trim() === "" ||
    BOT_PATTERNS.some((pattern) => pattern.test(userAgent));
  return { isBot, isPreview: false, previewApp: null };
}
