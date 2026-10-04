/** A Bogotá geo block as Cloudflare attaches it to `request.cf`. */
export const BOGOTA_CF = {
  country: "CO",
  region: "Bogota D.C.",
  city: "Bogotá",
  postalCode: "110111",
  continent: "SA",
  latitude: "4.60971",
  longitude: "-74.08175",
  timezone: "America/Bogota",
  colo: "BOG",
  asn: 10_620,
  asOrganization: "Telmex Colombia S.A.",
} as const;

/** Android Chrome on a Samsung phone. */
export const ANDROID_UA =
  "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36";

/** WhatsApp's link-preview fetcher. */
export const WHATSAPP_UA = "WhatsApp/2.24.20.79 A";

/** Googlebot. */
export const GOOGLEBOT_UA =
  "Mozilla/5.0 (compatible; Googlebot/2.1; +https://www.google.com/bot.html)";

/**
 * A request as the Worker receives it, with `cf` geo attached.
 *
 * @param url - Full URL.
 * @param headers - Extra headers (defaults: Android UA, an IP, es-CO).
 * @param cf - Geo block (defaults to Bogotá).
 * @returns The request.
 */
export function makeRequest(
  url: string,
  headers: Record<string, string> = {},
  cf: Record<string, unknown> = BOGOTA_CF
): Request {
  const request = new Request(url, {
    headers: {
      "user-agent": ANDROID_UA,
      "cf-connecting-ip": "203.0.113.7",
      "accept-language": "es-CO,es;q=0.9,en;q=0.8",
      ...headers,
    },
  });
  Object.defineProperty(request, "cf", { value: cf });
  return request;
}
