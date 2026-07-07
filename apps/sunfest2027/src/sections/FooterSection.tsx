import { useTranslation } from "react-i18next";
import { SocialLinks } from "@/components/SocialLinks";
import { tid } from "@/lib/tid";

/** Site footer: wordmark, tagline, hashtag, socials, and Furry Colombia credits. */
export function FooterSection() {
  const { t } = useTranslation();

  return (
    <footer
      className="relative overflow-hidden border-t border-white/10 bg-surface"
      data-testid={tid("section-footer")}
    >
      <div className="mx-auto max-w-5xl px-4 pb-10 pt-14">
        <div className="flex flex-col items-center text-center">
          <p className="text-sm font-bold uppercase tracking-[0.32em] text-foreground/85">
            {t("teaser.eyebrow")}
          </p>
          <p className="font-display mt-3 text-4xl font-bold text-yellow sm:text-5xl">
            {t("teaser.wordmark")}
          </p>
          <p className="mt-6 max-w-2xl text-sm text-muted-foreground sm:text-base">
            {t("footer.tagline")}
          </p>
          <p className="mt-2 text-sm font-semibold text-teal">
            {t("footer.hashtag")}
          </p>
          <div className="mt-6">
            <SocialLinks />
          </div>
          <div className="mt-8 space-y-1 text-xs text-muted-foreground/75">
            <p>{t("footer.credits")}</p>
            <p>{t("footer.copyright")}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
