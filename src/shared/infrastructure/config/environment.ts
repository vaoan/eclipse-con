/** Centralized runtime configuration derived from Vite environment variables. */
export const environment = {
  appName: String(import.meta.env.VITE_APP_NAME ?? "Moonfest 2026"),
  defaultLocale: String(import.meta.env.VITE_DEFAULT_LOCALE ?? "en"),
  supportedLocales: String(
    import.meta.env.VITE_SUPPORTED_LOCALES ?? "en,es"
  ).split(","),
  debug: import.meta.env.VITE_DEBUG === "true",
  analyticsEndpoint: String(
    import.meta.env.VITE_ANALYTICS_ENDPOINT ?? ""
  ).trim(),
  analyticsEnabled: import.meta.env.VITE_ANALYTICS_ENABLED !== "false",
  posthogApiKey: String(import.meta.env.VITE_POSTHOG_API_KEY ?? "").trim(),
  posthogHost: String(
    import.meta.env.VITE_POSTHOG_HOST ?? "https://us.i.posthog.com"
  ).trim(),
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;
