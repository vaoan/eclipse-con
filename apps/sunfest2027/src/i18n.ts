import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import en from "@/locales/en.json";
import es from "@/locales/es.json";

/**
 * Configured i18next instance for the teaser. Spanish is the default: the
 * detector only honours an explicit `?lng=` or a previously toggled choice
 * (localStorage); with neither, it falls back to `es` rather than the
 * visitor's browser language.
 */
void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { es: { translation: es }, en: { translation: en } },
    fallbackLng: "es",
    supportedLngs: ["es", "en"],
    detection: {
      order: ["querystring", "localStorage"],
      caches: ["localStorage"],
    },
    interpolation: { escapeValue: false },
  });

export default i18n;
