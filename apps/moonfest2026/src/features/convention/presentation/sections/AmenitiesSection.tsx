import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

import {
  AMENITY_CARD_KEYS,
  AMENITY_IMAGE_BY_KEY,
  RESTAURANT_IMAGE_BY_KEY,
  RESTAURANT_KEYS,
} from "@/features/convention/application/data/amenities";
import { SECTION_IDS } from "@/features/convention/domain/constants";
import { CruiseSpotlightBlock } from "./CruiseSpotlightBlock";
import { SectionHeader } from "../components/SectionHeader";
import { SectionWrapper } from "../components/SectionWrapper";

const buildAmenityCard = (
  t: TFunction,
  key: (typeof AMENITY_CARD_KEYS)[number]
) => ({
  key,
  title: t(`convention.amenities.cards.${key}.title`),
  description: t(`convention.amenities.cards.${key}.description`),
  price: t(`convention.amenities.cards.${key}.price`),
  priceApprox: t(`convention.amenities.cards.${key}.priceApprox`),
  priceNote: t(`convention.amenities.cards.${key}.priceNote`, {
    defaultValue: "",
  }),
  linkLabel: t(`convention.amenities.cards.${key}.linkLabel`),
  linkUrl: t(`convention.amenities.cards.${key}.linkUrl`),
  imageAlt: t(`convention.amenities.cards.${key}.imageAlt`),
});

const buildRestaurantCard = (
  t: TFunction,
  key: (typeof RESTAURANT_KEYS)[number]
) => ({
  key,
  title: t(`convention.amenities.restaurants.${key}.title`),
  description: t(`convention.amenities.restaurants.${key}.description`),
  price: t(`convention.amenities.restaurants.${key}.price`),
  linkLabel: t(`convention.amenities.restaurants.${key}.linkLabel`),
  linkUrl: t(`convention.amenities.restaurants.${key}.linkUrl`),
  imageAlt: t(`convention.amenities.restaurants.${key}.imageAlt`),
});

const toBulletItems = (value: string) =>
  value
    .split(/·|Â·/)
    .map((item) => item.trim())
    .filter(Boolean);

const BulletList = ({
  value,
  className = "text-sm font-semibold text-foreground/80",
  itemClassName = "",
}: Readonly<{
  value: string;
  className?: string;
  itemClassName?: string;
}>) => (
  <ul className={`list-disc space-y-1 pl-4 ${className}`.trim()}>
    {toBulletItems(value).map((item) => (
      <li key={item} className={itemClassName}>
        {item}
      </li>
    ))}
  </ul>
);

/** Bullet-item threshold: cards with this many or more items get the wide tile treatment. */
const WIDE_TILE_THRESHOLD = 4;

/** Shared hover-glow overlay used by every amenity tile. */
function TileGlow() {
  return (
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(224,117,58,0.12),_transparent_55%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
  );
}

/** Wide mosaic tile — spans 2 columns, horizontal image-left / content-right layout. */
function WideTile({
  item,
  t,
  eager,
}: Readonly<{
  item: ReturnType<typeof buildAmenityCard>;
  t: TFunction;
  eager: boolean;
}>) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-surface shadow-[0_20px_45px_-30px_rgba(15,23,42,0.9)] lg:col-span-2 lg:flex-row lg:p-5">
      <TileGlow />
      <div className="relative flex flex-1 flex-col gap-4 lg:flex-row lg:items-stretch">
        <div className="relative h-48 w-full shrink-0 overflow-hidden border-white/10 bg-black/20 lg:h-auto lg:w-[240px] lg:rounded-2xl lg:border">
          <img
            src={AMENITY_IMAGE_BY_KEY[item.key]}
            alt={item.imageAlt}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            loading={eager ? "eager" : "lazy"}
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2 p-5 lg:p-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-display text-xl font-semibold text-foreground">
              {item.title}
            </h3>
            <span className="shrink-0 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-accent">
              {item.price}
            </span>
          </div>
          <p className="text-sm text-foreground/70">{item.description}</p>
          <div className="mt-auto flex flex-col gap-1.5 pt-2">
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {t("convention.amenities.priceLabel")}
            </div>
            <BulletList
              value={item.priceApprox}
              className="text-sm font-semibold text-foreground/80 lg:columns-2 lg:gap-x-6"
            />
            {item.priceNote ? (
              <p className="text-xs text-foreground/55">{item.priceNote}</p>
            ) : null}
            <a
              href={item.linkUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent underline decoration-dashed underline-offset-4 transition hover:text-accent-glow"
              data-content-section="amenities"
              data-content-id={item.key}
            >
              {item.linkLabel}
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

/** Compact mosaic tile — single column, vertical image-top / content-bottom layout. */
function CompactTile({
  item,
  t,
  eager,
}: Readonly<{
  item: ReturnType<typeof buildAmenityCard>;
  t: TFunction;
  eager: boolean;
}>) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-surface shadow-[0_20px_45px_-30px_rgba(15,23,42,0.9)]">
      <TileGlow />
      <div className="relative h-40 w-full shrink-0 overflow-hidden">
        <img
          src={AMENITY_IMAGE_BY_KEY[item.key]}
          alt={item.imageAlt}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          loading={eager ? "eager" : "lazy"}
        />
      </div>
      <div className="relative flex flex-1 flex-col gap-2 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-lg font-semibold text-foreground">
            {item.title}
          </h3>
          <span className="shrink-0 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-accent">
            {item.price}
          </span>
        </div>
        <p className="text-sm text-foreground/70">{item.description}</p>
        <div className="mt-auto flex flex-col gap-1.5 pt-2">
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {t("convention.amenities.priceLabel")}
          </div>
          <BulletList value={item.priceApprox} />
          {item.priceNote ? (
            <p className="text-xs text-foreground/55">{item.priceNote}</p>
          ) : null}
          <a
            href={item.linkUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent underline decoration-dashed underline-offset-4 transition hover:text-accent-glow"
            data-content-section="amenities"
            data-content-id={item.key}
          >
            {item.linkLabel}
          </a>
        </div>
      </div>
    </article>
  );
}

/** Mosaic grid of amenity cards — content-heavy cards auto-span two columns. */
const AmenityCards = ({ t }: Readonly<{ t: TFunction }>) => (
  <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:[grid-auto-flow:dense]">
    {AMENITY_CARD_KEYS.map((key, index) => {
      const item = buildAmenityCard(t, key);
      const isWide =
        toBulletItems(item.priceApprox).length >= WIDE_TILE_THRESHOLD;
      const eager = index < 3;

      return isWide ? (
        <WideTile key={item.key} item={item} t={t} eager={eager} />
      ) : (
        <CompactTile key={item.key} item={item} t={t} eager={eager} />
      );
    })}
  </div>
);

const RestaurantsBlock = ({ t }: Readonly<{ t: TFunction }>) => (
  <div className="mt-12 rounded-3xl border border-white/10 bg-surface p-6">
    <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
          {t("convention.amenities.restaurants.eyebrow")}
        </p>
        <h3 className="mt-2 font-display text-2xl font-semibold text-foreground">
          {t("convention.amenities.restaurants.title")}
        </h3>
      </div>
      <p className="text-sm text-foreground/65">
        {t("convention.amenities.restaurants.subtitle")}
      </p>
    </div>
    <div className="mt-6 grid gap-5 lg:grid-cols-3">
      {RESTAURANT_KEYS.map((key) => {
        const restaurant = buildRestaurantCard(t, key);
        return (
          <article
            key={restaurant.key}
            className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-surface"
          >
            {/* Image — fixed height across all restaurant cards */}
            <div className="relative h-40 w-full shrink-0 overflow-hidden">
              <img
                src={RESTAURANT_IMAGE_BY_KEY[restaurant.key]}
                alt={restaurant.imageAlt}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                loading="lazy"
              />
            </div>
            {/* Content — flex-1 so cards share the same height, link at bottom */}
            <div className="flex flex-1 flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="font-display text-lg font-semibold text-foreground">
                    {restaurant.title}
                  </h4>
                  <p className="text-sm text-foreground/70">
                    {restaurant.description}
                  </p>
                </div>
                <span className="shrink-0 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-accent">
                  {restaurant.price}
                </span>
              </div>
              <a
                href={restaurant.linkUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-auto inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent underline decoration-dashed underline-offset-4 transition hover:text-accent-glow"
                data-content-section="amenities"
                data-content-id={`restaurant_${restaurant.key}`}
              >
                {restaurant.linkLabel}
              </a>
            </div>
          </article>
        );
      })}
    </div>
  </div>
);

/** Renders the Amenities section with hotel activity cards and restaurant listings. */
export function AmenitiesSection() {
  const { t } = useTranslation();

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
      <AmenityCards t={t} />
      <CruiseSpotlightBlock t={t} />
      <RestaurantsBlock t={t} />
      <p className="mt-6 text-xs text-muted-foreground">
        {t("convention.amenities.footerNote")}{" "}
        <a
          href={t("convention.amenities.footerLinkUrl")}
          target="_blank"
          rel="noreferrer"
          className="underline decoration-dashed underline-offset-4 transition hover:text-foreground"
          data-content-section="amenities"
          data-content-id="footer_activities_pdf"
        >
          {t("convention.amenities.footerLinkLabel")}
        </a>
        {" · "}
        <a
          href={t("convention.amenities.footerSpaUrl")}
          target="_blank"
          rel="noreferrer"
          className="underline decoration-dashed underline-offset-4 transition hover:text-foreground"
          data-content-section="amenities"
          data-content-id="footer_spa_pdf"
        >
          {t("convention.amenities.footerSpaLabel")}
        </a>
      </p>
    </SectionWrapper>
  );
}
