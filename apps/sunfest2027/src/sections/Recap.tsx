import { useTranslation } from "react-i18next";
import { FlagMarquee } from "@/components/FlagMarquee";
import { cn } from "@/lib/cn";
import { tid } from "@/lib/tid";
import { useScrollReveal } from "@/lib/useScrollReveal";

/**
 * A thank-you recap of the previous event that hypes the new one: the
 * attendee count and a moving line of the countries that took part.
 */
export function Recap() {
  const { t } = useTranslation();
  const { ref, revealed } = useScrollReveal();

  return (
    <section
      ref={ref}
      className={cn("section", "section-recap", revealed && "is-revealed")}
      data-content-section="recap"
      data-testid={tid("recap")}
    >
      <p className="section-eyebrow">{t("recap.eyebrow")}</p>
      <h2 className="section-title">{t("recap.title")}</h2>
      <p className="section-body">{t("recap.body")}</p>

      <p className="recap-stat">
        <span className="recap-number">224</span>
        <span className="recap-stat-label">{t("recap.attendees")}</span>
      </p>

      <FlagMarquee />
    </section>
  );
}
