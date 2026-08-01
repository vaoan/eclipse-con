import { useTranslation } from "react-i18next";
import { SocialLinks } from "@/components/SocialLinks";
import { tid } from "@/lib/tid";

/**
 * Closing footer: the brand line, the socials row and the copyright. Rendered
 * inside the closing section (see CtaBand) so it sits at the bottom of that
 * screen instead of forming a strip of its own.
 */
export function SiteFooter() {
  const { t } = useTranslation();
  return (
    <footer
      className="site-footer"
      data-content-section="footer"
      data-testid={tid("site-footer")}
    >
      <p className="footer">{t("teaser.footer")}</p>
      <SocialLinks contentSection="footer" />
      <p className="site-footer-legal">{t("footer.rights")}</p>
    </footer>
  );
}
