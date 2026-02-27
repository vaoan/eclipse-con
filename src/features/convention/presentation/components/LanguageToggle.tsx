import { useTranslation } from "react-i18next";

import { cn } from "@/shared/application/utils/cn";
import { tid } from "@/shared/application/utils/tid";

export function LanguageToggle() {
  const { i18n, t } = useTranslation();
  const isEnglish = i18n.resolvedLanguage?.startsWith("en") ?? true;
  const activeLanguageLabel = isEnglish ? "English" : "Español";
  const currentLanguageId = "language-toggle-current";

  function toggleLanguage() {
    void i18n.changeLanguage(isEnglish ? "es" : "en");
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isEnglish}
      aria-describedby={currentLanguageId}
      aria-label={t("convention.language.toggleAria", {
        language: activeLanguageLabel,
      })}
      onClick={toggleLanguage}
      data-cta-id="language_toggle"
      data-content-id="language_toggle"
      data-content-section="navigation"
      className={cn(
        "group relative inline-flex h-8 w-[68px] cursor-pointer select-none rounded-full p-0.5",
        "border border-accent/20 bg-background",
        "shadow-[inset_0_0_18px_rgba(201,168,76,0.05)]",
        "transition-all duration-200",
        "hover:border-accent/50 hover:shadow-[inset_0_0_18px_rgba(201,168,76,0.12),0_0_18px_rgba(201,168,76,0.16)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-1 focus-visible:ring-offset-background"
      )}
      {...tid("language-toggle")}
    >
      {/* Micro constellation dots — tiny stars in the dark half */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
      >
        <span className="absolute top-[5px] left-[18px] h-px w-px bg-foreground/25" />
        <span className="absolute bottom-[6px] left-[23px] h-px w-px bg-foreground/15" />
        <span className="absolute top-[6px] right-[16px] h-px w-px bg-foreground/20" />
        <span className="absolute bottom-[5px] right-[21px] h-px w-px bg-foreground/12" />
      </span>

      {/* Sliding gold moon orb */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-0.5 h-7 w-[30px] rounded-full",
          "bg-[radial-gradient(ellipse_at_42%_28%,#fff5cc,#e8c44a_40%,#c9a84c_68%,#9a7325)]",
          "shadow-[0_0_10px_rgba(201,168,76,0.65),0_0_22px_rgba(201,168,76,0.22),inset_0_1px_0_rgba(255,248,200,0.5)]",
          "transition-[left] duration-300 ease-out",
          isEnglish ? "left-0.5" : "left-[36px]"
        )}
      />

      {/* EN / ES labels */}
      <span className="absolute inset-0 z-10 flex items-center">
        <span
          className={cn(
            "flex w-1/2 items-center justify-center text-[9.5px] font-black tracking-[0.06em] transition-colors duration-300",
            isEnglish
              ? "text-background"
              : "text-foreground/35 group-hover:text-foreground/60"
          )}
        >
          EN
        </span>
        <span
          className={cn(
            "flex w-1/2 items-center justify-center text-[9.5px] font-black tracking-[0.06em] transition-colors duration-300",
            !isEnglish
              ? "text-background"
              : "text-foreground/35 group-hover:text-foreground/60"
          )}
        >
          ES
        </span>
      </span>

      <span id={currentLanguageId} className="sr-only">
        {t("convention.language.current", { language: activeLanguageLabel })}
      </span>
    </button>
  );
}
