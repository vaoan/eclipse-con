import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
import { tid } from "@/lib/tid";
import { useScrollReveal } from "@/lib/useScrollReveal";
import { HIGHLIGHTS } from "@/venue";

/** "What you'll find" — a grid of icon+label cards accented in carnaval hues. */
export function Highlights() {
  const { t } = useTranslation();
  const { ref, revealed } = useScrollReveal();
  return (
    <section
      ref={ref}
      className={cn("section", "section-highlights", revealed && "is-revealed")}
      data-content-section="highlights"
      data-testid={tid("highlights")}
    >
      <p className="section-eyebrow">{t("highlights.eyebrow")}</p>
      <h2 className="section-title">{t("highlights.title")}</h2>

      <ul className="cards">
        {HIGHLIGHTS.map(({ icon: Icon, labelKey, color }) => (
          <li
            key={labelKey}
            className="card"
            style={{ ["--card-accent" as string]: color }}
          >
            <Icon className="card-icon" aria-hidden="true" />
            <span className="card-label">{t(labelKey)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
