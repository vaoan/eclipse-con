import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "@/locales/en.json";
import es from "@/locales/es.json";

/** Languages this teaser ships. */
const SUPPORTED = ["es", "en"] as const;

/** Key i18next-browser-languagedetector wrote to, kept so saved choices survive. */
const STORAGE_KEY = "i18nextLng";

/**
 * Picks the starting language: an explicit `?lng=`, else a previously toggled
 * choice, else Spanish.
 *
 * This replaces i18next-browser-languagedetector, which cost ~2.3KB gzip to do
 * exactly this much. The visitor's browser language is ignored, as it was
 * before — with nothing else to go on, everyone starts in Spanish.
 *
 * @returns The language code to start in.
 */
function detectLanguage(): string {
  const isSupported = (value: string | null): value is string =>
    value !== null && SUPPORTED.some((code) => code === value);

  try {
    const fromQuery = new URLSearchParams(window.location.search).get("lng");
    if (isSupported(fromQuery)) {
      return fromQuery;
    }
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isSupported(stored)) {
      return stored;
    }
  } catch {
    // No DOM or storage blocked: fall through to the default.
  }
  return "es";
}

/**
 * Configured i18next instance for the teaser. Spanish is the default: only an
 * explicit `?lng=` or a previously toggled choice (localStorage) moves it,
 * never the visitor's browser language.
 */
void i18n.use(initReactI18next).init({
  resources: { es: { translation: es }, en: { translation: en } },
  lng: detectLanguage(),
  fallbackLng: "es",
  supportedLngs: [...SUPPORTED],
  interpolation: { escapeValue: false },
});

/**
 * Remember the active language, the way the detector's
 * `caches: ["localStorage"]` did.
 *
 * @param language - The language code now in effect.
 */
function remember(language: string): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, language);
  } catch {
    // Storage unavailable — the choice simply will not persist.
  }
}

// Cache the starting language too, not just later toggles: the detector did,
// which is what makes a shared `?lng=en` link stick on the next visit.
remember(i18n.resolvedLanguage ?? "es");
i18n.on("languageChanged", remember);

export default i18n;
