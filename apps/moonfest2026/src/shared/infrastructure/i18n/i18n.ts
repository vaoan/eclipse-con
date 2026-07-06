import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import { environment } from "@/shared/infrastructure/config/environment";
import en from "./locales/en.json";
import es from "./locales/es.json";

/** Bundled translation resources keyed by locale code. */
const resources = {
  en: { translation: en },
  es: { translation: es },
};

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: environment.defaultLocale,
    supportedLngs: environment.supportedLocales,
    nonExplicitSupportedLngs: true,
    load: "languageOnly",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["querystring", "localStorage", "navigator", "htmlTag"],
      lookupLocalStorage: "eclipse-con-locale-v2",
      caches: ["localStorage"],
    },
  });

/** Configured i18next instance with browser language detection and EN/ES resources. */
export default i18n;
