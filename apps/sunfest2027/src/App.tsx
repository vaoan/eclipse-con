import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FallingFlowers } from "@/components/FallingFlowers";
import { FollowCta } from "@/components/FollowCta";
import { Flower } from "@/components/Flower";
import { Marimonda } from "@/components/Marimonda";
import { SocialLinks } from "@/components/SocialLinks";
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

/** Single-screen sunfest2027 coming-soon teaser: a Colombian carnaval night. */
export function App() {
  const { t, i18n } = useTranslation();
  const wordmark = t("teaser.wordmark");
  const [brand, year] = splitWordmark(wordmark);

  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <main className="stage" data-testid={tid("teaser-root")}>
      <FallingFlowers />
      <div className="confetti" aria-hidden="true" />
      <div className="bunting" aria-hidden="true" />
      <Flower
        className="flower flower-1"
        variant={0}
        color="var(--color-magenta)"
      />
      <Flower
        className="flower flower-2"
        variant={2}
        color="var(--color-teal)"
      />
      <Flower
        className="flower flower-3"
        variant={3}
        color="var(--color-yellow)"
      />

      <div className="content">
        <Marimonda className="marimonda" />

        <p className="eyebrow">{t("teaser.eyebrow")}</p>

        <h1 className="wordmark" aria-label={wordmark}>
          <span aria-hidden="true">{brand}</span>
          {year && (
            <span className="year" aria-hidden="true">
              {year}
            </span>
          )}
        </h1>

        <p className="slogan">{t("teaser.slogan")}</p>
        <p className="subline">{t("teaser.subline")}</p>

        <FollowCta />
        <SocialLinks />

        <footer className="footer">{t("teaser.footer")}</footer>
      </div>
    </main>
  );
}
