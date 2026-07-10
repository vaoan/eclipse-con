import { useTranslation } from "react-i18next";
import { Flower } from "@/components/Flower";
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

/** Full-height hero: carnaval wordmark over a stand of Quindío wax palms. */
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
        <ScrollCue />
      </div>
    </section>
  );
}
