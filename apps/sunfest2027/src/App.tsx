import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FallingFlowers } from "@/components/FallingFlowers";
import { FollowCta } from "@/components/FollowCta";
import { LanguageToggle } from "@/components/LanguageToggle";
import { SocialLinks } from "@/components/SocialLinks";
import { Hero } from "@/sections/Hero";
import { tid } from "@/lib/tid";

/** Sunfest 2027 commercial teaser: a scrollable coffee-carnaval over the Quindío valley. */
export function App() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <main className="stage" data-testid={tid("teaser-root")}>
      <LanguageToggle />
      <FallingFlowers />
      <div className="confetti" aria-hidden="true" />
      <div className="garland" aria-hidden="true" />

      <Hero />

      <div className="content">
        <FollowCta />
        <SocialLinks />
        <footer className="footer">{t("teaser.footer")}</footer>
      </div>
    </main>
  );
}
