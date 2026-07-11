import { useTranslation } from "react-i18next";
import { FollowCta } from "@/components/FollowCta";
import { SocialLinks } from "@/components/SocialLinks";
import { cn } from "@/lib/cn";
import { tid } from "@/lib/tid";
import { useScrollReveal } from "@/lib/useScrollReveal";

/** Closing band: the reveal promise, the follow CTA, socials and footer. */
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
      <p className="section-eyebrow">{t("cta.eyebrow")}</p>
      <h2 className="section-title">{t("cta.title")}</h2>
      <p className="section-body">{t("cta.body")}</p>
      <FollowCta />
      <SocialLinks />
      <footer className="footer">{t("teaser.footer")}</footer>
    </section>
  );
}
