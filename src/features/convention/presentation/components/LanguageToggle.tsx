import { useTranslation } from "react-i18next";

import { cn } from "@/shared/application/utils/cn";
import { tid } from "@/shared/application/utils/tid";

export function LanguageToggle() {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === "en";

  function toggleLanguage() {
    void i18n.changeLanguage(isEnglish ? "es" : "en");
  }

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={cn(
        "rounded-md border border-accent/40 px-2.5 py-1 text-xs font-medium",
        "text-accent transition-colors hover:bg-accent/10"
      )}
      aria-label={isEnglish ? "Cambiar a español" : "Switch to English"}
      {...tid("language-toggle")}
    >
      {isEnglish ? "ES" : "EN"}
    </button>
  );
}
