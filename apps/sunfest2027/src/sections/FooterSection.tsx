import { useTranslation } from "react-i18next";
import { SocialLinks } from "@/components/SocialLinks";

/** Site footer: tagline, socials, Furry Colombia credits. */
export function FooterSection() {
  const { t } = useTranslation();
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <p className="footer-tag">{t("footer.tagline")}</p>
        <SocialLinks />
        <p className="footer-hashtag">{t("footer.hashtag")}</p>
        <p className="footer-credits">{t("footer.credits")}</p>
        <p className="footer-copy">{t("footer.copyright")}</p>
      </div>
    </footer>
  );
}
