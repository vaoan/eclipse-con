import { useTranslation } from "@/i18n";
import bannerSrc from "@/assets/hero/banner.webp";
import bannerNarrowSrc from "@/assets/hero/banner-1280.webp";
import { FollowCta } from "@/components/FollowCta";
import { tid } from "@/lib/tid";

/** The event is in September 2027; exact days are announced later (ISO 8601 month). */
const EVENT_MONTH = "2027-09";

/**
 * Full-screen hero: the Sunfest 2027 illustration fills the viewport, with the
 * wordmark, slogan, event month and CTA centered over it — the rest of the page
 * scrolls up beneath it. The slogan stays in Spanish in every locale, since a
 * translation changes its meaning.
 */
export function Hero() {
  const { t } = useTranslation();

  return (
    <section
      className="hero"
      data-content-section="teaser"
      data-testid={tid("hero")}
    >
      <img
        className="hero-banner"
        src={bannerSrc}
        srcSet={`${bannerNarrowSrc} 1280w, ${bannerSrc} 1920w`}
        sizes="100vw"
        alt={t("teaser.bannerAlt")}
        decoding="async"
        fetchPriority="high"
      />
      <div className="hero-scrim" aria-hidden="true" />

      <div className="content hero-content">
        <p className="eyebrow">{t("teaser.eyebrow")}</p>
        <h1 className="wordmark">{t("teaser.wordmark")}</h1>
        <p className="slogan" lang="es">
          {t("teaser.slogan")}
        </p>
        <p className="hero-dates">
          <time dateTime={EVENT_MONTH}>{t("teaser.dates")}</time>
        </p>
        <FollowCta
          testId="hero-follow"
          contentId="hero_follow_telegram"
          ctaId="hero_follow"
        />
      </div>
    </section>
  );
}
