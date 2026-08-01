import { useTranslation } from "react-i18next";
import { FollowCta } from "@/components/FollowCta";
import { SiteFooter } from "@/sections/SiteFooter";
import { cn } from "@/lib/cn";
import { tid } from "@/lib/tid";
import { useScrollReveal } from "@/lib/useScrollReveal";

/**
 * Closing beat: the reveal promise and follow CTA centred in the screen, with
 * the site footer sharing the same section so the page ends on one composed
 * screen rather than trailing off into a separate strip.
 */
export function CtaBand() {
  const { t } = useTranslation();
  const { ref, revealed } = useScrollReveal();
  return (
    <section
      ref={ref}
      className={cn("section", "cta-band", revealed && "is-revealed")}
      data-content-section="cta"
      data-testid={tid("cta-band")}
    >
      <div className="cta-band-message">
        <p className="section-eyebrow">{t("cta.eyebrow")}</p>
        <h2 className="section-title">{t("cta.title")}</h2>
        <p className="section-body">{t("cta.body")}</p>
        <FollowCta contentSection="cta" />
      </div>

      <SiteFooter />
    </section>
  );
}
