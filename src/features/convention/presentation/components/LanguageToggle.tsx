import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { cn } from "@/shared/application/utils/cn";
import { tid } from "@/shared/application/utils/tid";

interface LanguageToggleProps {
  readonly compact?: boolean;
}

export function LanguageToggle({ compact = false }: LanguageToggleProps) {
  const { i18n, t } = useTranslation();
  const isEnglish = i18n.resolvedLanguage?.startsWith("en") ?? true;
  const activeLanguageLabel = isEnglish ? "English" : "Español";
  const currentLanguageId = "language-toggle-current";

  function toggleLanguage() {
    void i18n.changeLanguage(isEnglish ? "es" : "en");
  }

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={toggleLanguage}
      className={cn(
        "group relative inline-flex h-9 items-center overflow-hidden rounded-full border border-accent/40 p-1",
        "bg-[linear-gradient(120deg,rgba(201,168,76,0.14),rgba(18,19,42,0.92),rgba(201,168,76,0.1))]",
        "transition-colors hover:border-accent/65",
        "focus-visible:ring-accent/50 focus-visible:ring-2 focus-visible:outline-none",
        compact ? "min-w-[80px]" : "min-w-[170px]"
      )}
      role="switch"
      aria-checked={isEnglish}
      aria-describedby={currentLanguageId}
      aria-label={t("convention.language.toggleAria", {
        language: activeLanguageLabel,
      })}
      {...tid("language-toggle")}
    >
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-accent/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <span className="pointer-events-none absolute inset-y-1 left-1 right-1 z-0">
        <span
          className={cn(
            "block h-full w-1/2 rounded-full border border-accent/30 bg-accent shadow-[0_0_14px_rgba(201,168,76,0.32)] transition-transform duration-300 ease-out",
            isEnglish ? "translate-x-0" : "translate-x-full"
          )}
        />
      </span>
      <span className="relative z-10 grid w-full grid-cols-2 items-center text-[11px] font-semibold tracking-[0.01em]">
        <span
          className={cn(
            "flex h-7 items-center justify-center transition-colors",
            isEnglish ? "text-accent-foreground" : "text-foreground/60"
          )}
        >
          {compact ? "EN" : "English"}
        </span>
        <span
          className={cn(
            "flex h-7 items-center justify-center transition-colors",
            !isEnglish ? "text-accent-foreground" : "text-foreground/60"
          )}
        >
          {compact ? "ES" : "Español"}
        </span>
      </span>
      <span id={currentLanguageId} className="sr-only">
        {t("convention.language.current", { language: activeLanguageLabel })}
      </span>
    </Button>
  );
}
