import { useTranslation } from "react-i18next";
import bannerSrc from "@/assets/hero/banner.webp";
import { ScrollCue } from "@/components/ScrollCue";
import { WaxPalm } from "@/components/WaxPalm";
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

/** Hero: the carnaval wordmark over a full-width Sunfest 2027 illustration. */
export function Hero() {
  const { t } = useTranslation();
  const wordmark = t("teaser.wordmark");
  const [brand, year] = splitWordmark(wordmark);

  return (
    <section
      className="hero"
      data-content-section="teaser"
      data-testid={tid("hero")}
    >
      <div className="valley" aria-hidden="true">
        <WaxPalm className="palm palm-1" src="/assets/palm-1.svg" />
        <WaxPalm className="palm palm-2" src="/assets/palm-2.svg" />
        <WaxPalm className="palm palm-3" src="/assets/palm-3.svg" />
        <WaxPalm className="palm palm-4" src="/assets/palm-4.svg" />
      </div>

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
        <p className="slogan">{t("teaser.slogan")}</p>
        <p className="subline">{t("teaser.subline")}</p>
      </div>

      <img
        className="hero-banner"
        src={bannerSrc}
        alt={t("teaser.bannerAlt")}
        decoding="async"
      />

      <ScrollCue />
    </section>
  );
}
