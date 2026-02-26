import { useTranslation } from "react-i18next";

import { SECTION_IDS } from "@/features/convention/domain/constants";
import { SectionHeader } from "../components/SectionHeader";
import { SectionWrapper } from "../components/SectionWrapper";

const AMENITY_IMAGE_BY_KEY = {
  spa: "https://www.estelarpaipa.com/media/uploads/fotoservicio/servicio-spa-paipa.webp?q=pr%3Asharp%2Frs%3Afill%2Fw%3A1200%2Fh%3A600%2Fg%3Ace%2Ff%3Ajpg",
  dining:
    "https://www.estelarpaipa.com/media/uploads/fotoservicio/LR_35_de_85-12_1.jpg?q=pr%3Asharp%2Frs%3Afill%2Fw%3A1200%2Fh%3A600%2Fg%3Ace%2Ff%3Ajpg",
  stables:
    "https://www.estelarpaipa.com/media/uploads/fotoservicio/DUF_8717_U_OK.jpg?q=pr%3Asharp%2Frs%3Afill%2Fw%3A1200%2Fh%3A600%2Fg%3Ace%2Ff%3Ajpg",
  farm: "https://www.estelarpaipa.com/media/uploads/fotoservicio/DUF_9537_U_OK.jpg?q=pr%3Asharp%2Frs%3Afill%2Fw%3A1200%2Fh%3A600%2Fg%3Ace%2Ff%3Ajpg",
  family:
    "https://www.estelarpaipa.com/media/uploads/fotoservicio/servicios-familia-paipa.webp?q=pr%3Asharp%2Frs%3Afill%2Fw%3A1200%2Fh%3A600%2Fg%3Ace%2Ff%3Ajpg",
} as const;

const AMENITY_CARD_KEYS = [
  "spa",
  "dining",
  "stables",
  "farm",
  "family",
] as const;

export function AmenitiesSection() {
  const { t } = useTranslation();
  const buildCard = (key: (typeof AMENITY_CARD_KEYS)[number]) => ({
    key,
    title: t(`convention.amenities.cards.${key}.title`),
    description: t(`convention.amenities.cards.${key}.description`),
    price: t(`convention.amenities.cards.${key}.price`),
    priceApprox: t(`convention.amenities.cards.${key}.priceApprox`),
    priceNote:
      key === "family" ? t(`convention.amenities.cards.${key}.priceNote`) : "",
    imageAlt: t(`convention.amenities.cards.${key}.imageAlt`),
  });

  return (
    <SectionWrapper id={SECTION_IDS.AMENITIES} surfaceTone="elevated">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionHeader
          title={t("convention.amenities.title")}
          align="left"
          accent="red"
        />
        <p className="max-w-md text-sm text-muted-foreground sm:text-base">
          {t("convention.amenities.subtitle")}
        </p>
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {AMENITY_CARD_KEYS.map((key, index) => {
          const item = buildCard(key);
          return (
            <article
              key={item.key}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-surface/80 p-5 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.9)]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(244,63,94,0.12),_transparent_55%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative grid gap-4 md:grid-cols-[180px_1fr] md:items-center">
                <div className="relative h-32 w-full overflow-hidden rounded-2xl border border-white/10 bg-black/20 md:h-28">
                  <img
                    src={AMENITY_IMAGE_BY_KEY[item.key]}
                    alt={item.imageAlt}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    loading={index < 2 ? "eager" : "lazy"}
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-display text-xl font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <span className="rounded-full border border-rose-400/30 bg-rose-500/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-rose-200">
                      {item.price}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/70">
                    {item.description}
                  </p>
                  <div className="text-xs uppercase tracking-[0.18em] text-foreground/45">
                    {t("convention.amenities.priceLabel")}
                  </div>
                  <p className="text-sm font-semibold text-foreground/80">
                    {item.priceApprox}
                  </p>
                  {item.priceNote ? (
                    <p className="text-xs text-foreground/55">
                      {item.priceNote}
                    </p>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <p className="mt-6 text-xs text-muted-foreground">
        {t("convention.amenities.footerNote")}{" "}
        <a
          href={t("convention.amenities.footerLinkUrl")}
          target="_blank"
          rel="noreferrer"
          className="underline decoration-dashed underline-offset-4 transition hover:text-foreground"
        >
          {t("convention.amenities.footerLinkLabel")}
        </a>
        .
      </p>
    </SectionWrapper>
  );
}
