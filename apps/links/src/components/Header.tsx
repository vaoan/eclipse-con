import { useTranslation } from "@/i18n";
import { tid } from "@/lib/tid";
import type { Me } from "@/types";

interface HeaderProps {
  readonly me: Me | null;
}

/** Access's logout endpoint (ends the Zero Trust session for this app). */
const LOGOUT_URL = "/cdn-cgi/access/logout";

/** Title bar: who is signed in, the Sheet link, language switch, sign out. */
export function Header({ me }: Readonly<HeaderProps>) {
  const { t, i18n } = useTranslation();
  const identity = me?.email ?? me?.serviceToken;
  return (
    <header
      className="topbar"
      data-content-section="navigation"
      data-testid={tid("header")}
    >
      <h1 className="brand">{t("header.title")}</h1>
      <div className="topbar-actions">
        {identity ? (
          <span className="muted small">
            {t("header.signedInAs", { email: identity })}
          </span>
        ) : null}
        {me?.sheetUrl ? (
          <a
            className="button"
            href={me.sheetUrl}
            target="_blank"
            rel="noreferrer"
            data-content-section="navigation"
            data-content-id="open_sheet"
            data-cta-id="open_sheet"
          >
            {t("header.openSheet")}
          </a>
        ) : null}
        <button
          type="button"
          className="ghost-button"
          onClick={() => {
            i18n.changeLanguage(i18n.language === "es" ? "en" : "es");
          }}
          data-content-section="navigation"
          data-content-id="language_toggle"
          data-content-interaction="toggle"
        >
          {t("header.language")}
        </button>
        <a
          className="ghost-button"
          href={LOGOUT_URL}
          data-content-section="navigation"
          data-content-id="sign_out"
        >
          {t("header.signOut")}
        </a>
      </div>
    </header>
  );
}
