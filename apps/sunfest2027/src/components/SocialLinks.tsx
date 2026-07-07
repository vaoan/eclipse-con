import { useTranslation } from "react-i18next";
import { SOCIAL_ICON_COLOR, SOCIALS } from "@/socials";

/** Compact row of Furry Colombia community icon links (monochrome). */
export function SocialLinks() {
  const { t } = useTranslation();
  return (
    <nav className="socials" aria-label={t("teaser.socialsLabel")}>
      {SOCIALS.map((social) => (
        <a
          key={social.slug}
          href={social.href}
          target="_blank"
          rel="noreferrer"
          className="social"
          aria-label={`${t("teaser.followOn")} ${social.label}`}
          data-content-section="teaser"
          data-content-id={`social_${social.slug}`}
        >
          <img
            src={`https://cdn.simpleicons.org/${social.slug}/${SOCIAL_ICON_COLOR}`}
            alt=""
            width={22}
            height={22}
            loading="lazy"
          />
        </a>
      ))}
    </nav>
  );
}
