/** Display name of the application. */
export const APP_NAME = "Moonfest 2026";

/** Default locale used when no user preference is detected. */
export const DEFAULT_LOCALE = "en";

/** All locale codes supported by the application. */
export const SUPPORTED_LOCALES = ["en", "es"] as const;

/** Union type of all supported locale codes. */
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
