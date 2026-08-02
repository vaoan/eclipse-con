import { useTranslation } from "react-i18next";
import moonfestLogoSrc from "@/assets/moonfest-logo.svg";
import { FlagMarquee } from "@/components/FlagMarquee";
import { NightSkyCanvas } from "@/components/NightSkyCanvas";
import { cn } from "@/lib/cn";
import { tid } from "@/lib/tid";
import { useScrollReveal } from "@/lib/useScrollReveal";

/** The archived Moonfest 2026 site; the old moonfest host now 301s to Sunfest. */
const MOONFEST_ARCHIVE_URL = "https://moonfest2026.furrycolombia.com/";

/**
 * A thank-you recap of the previous event that hypes the new one: the
 * attendee count and a moving line of the countries that took part. Sits on a
 * night sky with the Moonfest logo watermarked behind it, carrying that site's
 * treatment over to the one section that looks back at its event.
 */
export function Recap() {
  const { t } = useTranslation();
  const { ref, revealed } = useScrollReveal();

  return (
    <section
      ref={ref}
      className={cn("section", "section-recap", revealed && "is-revealed")}
      data-content-section="recap"
      data-testid={tid("recap")}
    >
      <NightSkyCanvas className="recap-sky" />

      <img
        className="recap-watermark"
        src={moonfestLogoSrc}
        alt=""
        aria-hidden="true"
        draggable={false}
      />

      <p className="section-eyebrow">{t("recap.eyebrow")}</p>
      <h2 className="section-title">{t("recap.title")}</h2>
      <p className="section-body">{t("recap.body")}</p>

      <p className="recap-stat">
        <span className="recap-number">224</span>
        <span className="recap-stat-label">{t("recap.attendees")}</span>
      </p>

      <FlagMarquee />

      <a
        className="recap-archive-link"
        href={MOONFEST_ARCHIVE_URL}
        target="_blank"
        rel="noopener noreferrer"
        data-content-section="recap"
        data-content-id="recap_moonfest_archive"
        data-cta-id="recap_moonfest_archive"
        data-content-interaction="open"
        data-testid={tid("recap-archive-link")}
      >
        {t("recap.archiveLink")}
      </a>
    </section>
  );
}
