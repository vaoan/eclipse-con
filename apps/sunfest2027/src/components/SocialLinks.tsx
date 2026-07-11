import { useTranslation } from "react-i18next";
import { SOCIAL_ICON_COLOR, SOCIALS } from "@/socials";

/** Props for {@link SocialLinks}. */
interface SocialLinksProps {
  /** Analytics section these links are attributed to. Defaults to `"teaser"`. */
  readonly contentSection?: string;
}

/** Compact row of Furry Colombia community icon links (monochrome). */
export function SocialLinks({
  contentSection = "teaser",
}: Readonly<SocialLinksProps>) {
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
          data-content-section={contentSection}
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
