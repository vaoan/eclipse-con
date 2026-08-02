import { useTranslation } from "@/i18n";
import { RECAP_COUNTRIES } from "@/flags";
import { cn } from "@/lib/cn";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/**
 * A horizontally scrolling line of participating-country flags. Duplicates the
 * list so the scroll loops seamlessly; under reduced motion it becomes a
 * static, centered, wrapped row instead.
 */
export function FlagMarquee() {
  const { t } = useTranslation();
  const prefersReducedMotion = usePrefersReducedMotion();
  const items = prefersReducedMotion
    ? RECAP_COUNTRIES.map((country) => ({ country, aria: false }))
    : [...RECAP_COUNTRIES, ...RECAP_COUNTRIES].map((country, index) => ({
        country,
        aria: index >= RECAP_COUNTRIES.length,
      }));

  return (
    <div
      className={cn(
        "flag-marquee",
        prefersReducedMotion && "flag-marquee-static"
      )}
      role="group"
      aria-label={t("recap.countriesAria")}
    >
      <div className="flag-track">
        {items.map(({ country, aria }, index) => (
          <span
            key={`${country.code}-${index}`}
            className="flag-item"
            aria-hidden={aria}
          >
            <img src={country.src} alt="" className="flag-img" />
            <span className="flag-name">{t(country.nameKey)}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
