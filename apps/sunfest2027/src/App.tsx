import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FollowCta } from "@/components/FollowCta";
import { tid } from "@/lib/tid";

/** Split a "Brand YEAR" wordmark into its brand and trailing-year parts. */
function splitWordmark(wordmark: string): readonly [string, string] {
  const lastSpace = wordmark.lastIndexOf(" ");
  if (lastSpace > 0) {
    const tail = wordmark.slice(lastSpace + 1);
    if (/^\d{4}$/.test(tail)) {
      return [wordmark.slice(0, lastSpace), tail];
    }
  }
  return [wordmark, ""];
}

/** Single-screen sunfest2027 coming-soon teaser: a radiant tropical sun. */
export function App() {
  const { t, i18n } = useTranslation();
  const wordmark = t("teaser.wordmark");
  const [brand, year] = splitWordmark(wordmark);

  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <main className="stage" data-testid={tid("teaser-root")}>
      <div className="rays" aria-hidden="true" />
      <div className="haze" aria-hidden="true" />

      <div className="content">
        <p className="eyebrow">{t("teaser.eyebrow")}</p>

        <h1 className="wordmark" aria-label={wordmark}>
          <span aria-hidden="true">{brand}</span>
          {year && (
            <span className="year" aria-hidden="true">
              {year}
            </span>
          )}
        </h1>

        <p className="thesis">{t("teaser.thesis")}</p>
        <p className="subline">{t("teaser.subline")}</p>

        <FollowCta />

        <footer className="footer">{t("teaser.footer")}</footer>
      </div>
    </main>
  );
}
