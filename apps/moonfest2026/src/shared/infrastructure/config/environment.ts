import type { AnalyticsProfile } from "@/features/analytics/infrastructure/trackingSchema";

type RuntimeConfig = Partial<Record<`VITE_${string}`, string>>;
type PublicEnvKey = keyof RuntimeConfig;

function getRuntimeConfig(): RuntimeConfig {
  if (typeof window === "undefined") {
    return {};
  }

  return window.__ECLIPSE_CON_RUNTIME_CONFIG__ ?? {};
}

function readEnv(name: PublicEnvKey): string {
  const runtimeValue = getRuntimeConfig()[name];
  if (typeof runtimeValue === "string") {
    return runtimeValue;
  }

  return String(import.meta.env[name] ?? "");
}

function readBooleanEnv(name: PublicEnvKey, defaultValue: boolean): boolean {
  const value = readEnv(name).trim().toLowerCase();

  if (value.length === 0) {
    return defaultValue;
  }

  return value === "true";
}

function readListEnv(name: PublicEnvKey, fallback: string): string[] {
  return (readEnv(name) || fallback)
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

const analyticsProfile =
  readEnv("VITE_ANALYTICS_PROFILE").trim().toLowerCase() === "full"
    ? "full"
    : "lean";
const cloudflareWebAnalyticsEnabled = readBooleanEnv(
  "VITE_CF_WEB_ANALYTICS_ENABLED",
  false
);
const googleAnalyticsEnabled =
  readEnv("VITE_GA_MEASUREMENT_ENABLED") !== "false";
const googleTagManagerEnabled = readEnv("VITE_GTM_ENABLED") !== "false";

/** Centralized runtime configuration derived from Vite environment variables. */
export const environment = {
  appName: readEnv("VITE_APP_NAME") || "moonfest 2026",
  appVersion: readEnv("VITE_APP_VERSION") || "dev",
  defaultLocale: readEnv("VITE_DEFAULT_LOCALE") || "en",
  supportedLocales: readListEnv("VITE_SUPPORTED_LOCALES", "en,es"),
  debug: readBooleanEnv("VITE_DEBUG", false),
  analyticsEndpoint: readEnv("VITE_ANALYTICS_ENDPOINT").trim(),
  analyticsEnabled: readBooleanEnv("VITE_ANALYTICS_ENABLED", false),
  cloudflareWebAnalyticsEnabled,
  cfWebAnalyticsToken: readEnv("VITE_CF_WEB_ANALYTICS_TOKEN").trim(),
  googleAnalyticsEnabled,
  gaMeasurementId: readEnv("VITE_GA_MEASUREMENT_ID").trim(),
  googleTagManagerEnabled,
  gtmContainerId: readEnv("VITE_GTM_CONTAINER_ID").trim(),
  posthogApiKey: readEnv("VITE_POSTHOG_API_KEY").trim(),
  posthogHost:
    readEnv("VITE_POSTHOG_HOST").trim() || "https://us.i.posthog.com",
  analyticsProfile: analyticsProfile as AnalyticsProfile,
  renderTestIds:
    import.meta.env.DEV || readBooleanEnv("VITE_ENABLE_TEST_IDS", false),
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;
