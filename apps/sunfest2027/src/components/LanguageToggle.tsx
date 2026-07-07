import { useTranslation } from "react-i18next";
import { tid } from "@/lib/tid";

/** Segmented ES / EN control with a sliding thumb that switches the locale. */
export function LanguageToggle() {
  const { i18n, t } = useTranslation();
  const current = i18n.resolvedLanguage?.startsWith("en") ? "en" : "es";

  function setLanguage(language: "es" | "en") {
    void i18n.changeLanguage(language);
  }

  return (
    <div
      className="lang-toggle"
      role="group"
      aria-label={t("teaser.language")}
      data-active={current}
    >
      <span className="lang-thumb" aria-hidden="true" />
      <button
        type="button"
        className="lang-opt"
        aria-pressed={current === "es"}
        aria-label="Español"
        onClick={() => {
          setLanguage("es");
        }}
        data-content-section="navigation"
        data-content-id="language_es"
        data-cta-id="language_toggle"
        data-testid={tid("lang-es")}
      >
        ES
      </button>
      <button
        type="button"
        className="lang-opt"
        aria-pressed={current === "en"}
        aria-label="English"
        onClick={() => {
          setLanguage("en");
        }}
        data-content-section="navigation"
        data-content-id="language_en"
        data-cta-id="language_toggle"
        data-testid={tid("lang-en")}
      >
        EN
      </button>
    </div>
  );
}
