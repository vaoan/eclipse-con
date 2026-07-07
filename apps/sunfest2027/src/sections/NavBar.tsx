import { useTranslation } from "react-i18next";
import { LanguageToggle } from "@/components/LanguageToggle";
import { NAV_LINKS, SECTION_IDS } from "@/content";

const FOLLOW_URL = "https://t.me/furrycolombia";

/** Sticky top navigation: brand, section anchors, language toggle, follow CTA. */
export function NavBar() {
  const { t } = useTranslation();
  return (
    <nav className="nav" aria-label={t("nav.menu")}>
      <a
        className="nav-brand"
        href={`#${SECTION_IDS.hero}`}
        data-content-section="navigation"
        data-content-id="nav_brand"
        data-cta-id="nav_logo"
      >
        Sunfest
      </a>

      <ul className="nav-links">
        {NAV_LINKS.map((id) => (
          <li key={id}>
            <a
              href={`#${id}`}
              data-content-section="navigation"
              data-content-id={`nav_${id}`}
            >
              {t(`nav.${id}`)}
            </a>
          </li>
        ))}
      </ul>

      <div className="nav-actions">
        <LanguageToggle />
        <a
          className="nav-follow"
          href={FOLLOW_URL}
          target="_blank"
          rel="noreferrer"
          data-content-section="navigation"
          data-content-id="nav_follow"
          data-cta-id="nav_follow"
        >
          {t("nav.follow")}
        </a>
      </div>
    </nav>
  );
}
