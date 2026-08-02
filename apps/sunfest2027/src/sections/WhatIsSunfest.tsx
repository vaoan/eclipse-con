import { useTranslation } from "@/i18n";
import { cn } from "@/lib/cn";
import { tid } from "@/lib/tid";
import { useScrollReveal } from "@/lib/useScrollReveal";

/** "What is Sunfest?" — a short, centered intro to the event. */
export function WhatIsSunfest() {
  const { t } = useTranslation();
  const { ref, revealed } = useScrollReveal();
  return (
    <section
      ref={ref}
      className={cn("section", "section-about", revealed && "is-revealed")}
      data-content-section="about"
      data-testid={tid("about")}
    >
      <p className="section-eyebrow">{t("about.eyebrow")}</p>
      <h2 className="section-title">{t("about.title")}</h2>
      <p className="section-body">{t("about.body")}</p>
    </section>
  );
}
