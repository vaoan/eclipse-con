import { useTranslation } from "react-i18next";
import { SocialLinks } from "@/components/SocialLinks";
import { tid } from "@/lib/tid";

/** Closing footer: the socials row again plus the copyright line. */
export function SiteFooter() {
  const { t } = useTranslation();
  return (
    <footer
      className="site-footer"
      data-content-section="footer"
      data-testid={tid("site-footer")}
    >
      <SocialLinks contentSection="footer" />
      <p className="site-footer-legal">{t("footer.rights")}</p>
    </footer>
  );
}
