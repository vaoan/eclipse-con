export const environment = {
  appName: String(import.meta.env.VITE_APP_NAME ?? "Moonfest 2026"),
  defaultLocale: String(import.meta.env.VITE_DEFAULT_LOCALE ?? "en"),
  supportedLocales: String(
    import.meta.env.VITE_SUPPORTED_LOCALES ?? "en,es"
  ).split(","),
  debug: import.meta.env.VITE_DEBUG === "true",
  cloudflareAnalyticsToken: String(
    import.meta.env.VITE_CF_WEB_ANALYTICS_TOKEN ?? ""
  ).trim(),
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;
