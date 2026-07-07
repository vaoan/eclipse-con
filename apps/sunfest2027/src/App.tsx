import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FallingFlowers } from "@/components/FallingFlowers";
import { FollowCta } from "@/components/FollowCta";
import { Flower } from "@/components/Flower";
import { WaxPalm } from "@/components/WaxPalm";
import { SECTION_IDS } from "@/content";
import { useSectionUrlSync } from "@/lib/useSectionUrlSync";
import { AboutSection } from "@/sections/AboutSection";
import { ActivitiesSection } from "@/sections/ActivitiesSection";
import { AmenitiesSection } from "@/sections/AmenitiesSection";
import { FaqSection } from "@/sections/FaqSection";
import { FooterSection } from "@/sections/FooterSection";
import { NavBar } from "@/sections/NavBar";
import { OrganizersSection } from "@/sections/OrganizersSection";
import { TravelSection } from "@/sections/TravelSection";
import { VenueSection } from "@/sections/VenueSection";
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

/** Sunfest 2027 site: carnaval hero over the Quindío valley + info sections. */
export function App() {
  const { t, i18n } = useTranslation();
  const wordmark = t("teaser.wordmark");
  const [brand, year] = splitWordmark(wordmark);

  useSectionUrlSync();

  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <>
      <div
        className="fixed inset-0 -z-10 bg-[linear-gradient(to_bottom,#1e0c3a_0%,#2a1150_42%,#3a1c66_72%,#1e0c3a_100%)]"
        aria-hidden="true"
      />
      <NavBar />
      <main>
        <section
          id={SECTION_IDS.hero}
          className="stage"
          data-testid={tid("teaser-root")}
        >
          <FallingFlowers />
          <div className="confetti" aria-hidden="true" />
          <div className="garland" aria-hidden="true" />

          <div className="valley" aria-hidden="true">
            <WaxPalm className="palm palm-1" />
            <WaxPalm className="palm palm-2" />
            <WaxPalm className="palm palm-3" />
            <WaxPalm className="palm palm-4" />
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
            <p className="date-line">{t("teaser.date")}</p>
            <p className="subline">{t("teaser.subline")}</p>

            <FollowCta />

            <a
              className="scroll-cue"
              href={`#${SECTION_IDS.about}`}
              data-content-section="hero"
              data-content-id="scroll_cue"
            >
              {t("teaser.scroll")}
            </a>
          </div>
        </section>

        <AboutSection />
        <ActivitiesSection />
        <VenueSection />
        <AmenitiesSection />
        <TravelSection />
        <OrganizersSection />
        <FaqSection />
        <FooterSection />
      </main>
    </>
  );
}
