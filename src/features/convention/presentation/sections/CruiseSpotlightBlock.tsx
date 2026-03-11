import type { TFunction } from "i18next";

const CRUISE_SPOTLIGHT_IMAGE =
  "https://www.estelarpaipa.com/media/uploads/galeriahoteles/estelar-paipa-lago.webp?q=pr%3Asharp%2Frs%3Afill%2Fw%3A1440%2Fh%3A1080%2Fg%3Ace%2Ff%3Ajpg";

const CRUISE_DETAIL_KEYS = ["day", "estelar"] as const;
const CRUISE_QUICK_FACT_KEYS = [
  "duration",
  "pricing",
  "minimumGroup",
  "booking",
] as const;
const CRUISE_LOGISTICS_KEYS = [
  "headcount",
  "schedule",
  "reservation",
  "confirmation",
] as const;

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

const LogisticsBanner = ({ t }: Readonly<{ t: TFunction }>) => (
  <div className="mt-6 overflow-hidden rounded-[1.6rem] border border-amber-200/25 bg-[linear-gradient(135deg,rgba(251,191,36,0.26),rgba(249,115,22,0.2))] shadow-[0_18px_40px_-26px_rgba(251,146,60,0.75)]">
    <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-start gap-3">
        <span className="mt-1 inline-flex h-3 w-3 shrink-0 rounded-full bg-amber-300 shadow-[0_0_0_6px_rgba(253,224,71,0.18)]" />
        <div>
          <p className="text-[0.68rem] font-black uppercase tracking-[0.34em] text-amber-50">
            {t("convention.amenities.cruiseSpotlight.logisticsBanner")}
          </p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-amber-50/88">
            {t("convention.amenities.cruiseSpotlight.logisticsBannerDetail")}
          </p>
        </div>
      </div>
      <a
        href={t("convention.amenities.cruiseSpotlight.telegramLinkUrl")}
        target="_blank"
        rel="noreferrer"
        className="inline-flex min-h-11 items-center justify-center gap-3 rounded-full border border-sky-300/30 bg-[linear-gradient(135deg,#2AABEE,#229ED9)] px-5 py-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-[0_16px_30px_-18px_rgba(34,158,217,0.95)] transition hover:scale-[1.01] hover:shadow-[0_20px_36px_-18px_rgba(34,158,217,1)]"
        data-content-section="amenities"
        data-content-id="cruise_spotlight_telegram"
      >
        <img
          src="https://cdn.simpleicons.org/telegram/ffffff?viewbox=auto"
          alt=""
          aria-hidden="true"
          className="h-5 w-5 shrink-0"
          loading="lazy"
        />
        {t("convention.amenities.cruiseSpotlight.telegramLinkLabel")}
      </a>
    </div>
  </div>
);

const QuickFacts = ({ t }: Readonly<{ t: TFunction }>) => (
  <div className="mt-8 grid gap-4 sm:grid-cols-2">
    {CRUISE_QUICK_FACT_KEYS.map((key) => (
      <article
        key={key}
        className="rounded-2xl border border-white/12 bg-white/7 p-4 backdrop-blur-sm"
      >
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/66">
          {t(`convention.amenities.cruiseSpotlight.quickFacts.${key}.label`)}
        </p>
        <BulletList
          value={t(
            `convention.amenities.cruiseSpotlight.quickFacts.${key}.value`
          )}
          className="mt-2 text-sm font-semibold text-white"
          itemClassName="text-white"
        />
      </article>
    ))}
  </div>
);

const LogisticsGrid = ({ t }: Readonly<{ t: TFunction }>) => (
  <div className="mt-8 rounded-[1.75rem] border border-white/12 bg-slate-950/24 p-5">
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100/68">
          {t("convention.amenities.cruiseSpotlight.logistics.eyebrow")}
        </p>
        <h4 className="mt-2 font-display text-2xl font-semibold text-white">
          {t("convention.amenities.cruiseSpotlight.logistics.title")}
        </h4>
      </div>
      <p className="max-w-md text-sm text-cyan-50/70">
        {t("convention.amenities.cruiseSpotlight.logistics.subtitle")}
      </p>
    </div>
    <div className="mt-5 grid gap-4 md:grid-cols-2">
      {CRUISE_LOGISTICS_KEYS.map((key) => (
        <article
          key={key}
          className="rounded-2xl border border-white/10 bg-white/6 p-4"
        >
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/66">
            {t(
              `convention.amenities.cruiseSpotlight.logistics.items.${key}.label`
            )}
          </p>
          <p className="mt-2 text-sm leading-6 text-white/88">
            {t(
              `convention.amenities.cruiseSpotlight.logistics.items.${key}.value`
            )}
          </p>
        </article>
      ))}
    </div>
  </div>
);

const OptionCards = ({ t }: Readonly<{ t: TFunction }>) => (
  <div className="mt-8 grid gap-4 xl:grid-cols-2">
    {CRUISE_DETAIL_KEYS.map((key) => (
      <article
        key={key}
        className="flex h-full min-h-[252px] flex-col rounded-3xl border border-white/12 bg-black/12 p-5"
      >
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/68">
            {t(`convention.amenities.cruiseSpotlight.options.${key}.eyebrow`)}
          </p>
          <h4 className="mt-2 min-h-[3.5rem] font-display text-xl font-semibold text-white">
            {t(`convention.amenities.cruiseSpotlight.options.${key}.title`)}
          </h4>
        </div>
        <div className="mt-4 rounded-2xl border border-cyan-200/16 bg-cyan-100/8 px-4 py-3">
          <p className="text-[0.62rem] font-black uppercase tracking-[0.3em] text-cyan-100/62">
            {t("convention.amenities.cruiseSpotlight.optionDurationLabel")}
          </p>
          <p className="mt-2 text-sm font-semibold leading-6 text-cyan-50">
            {t(`convention.amenities.cruiseSpotlight.options.${key}.duration`)}
          </p>
        </div>
        <p className="mt-4 min-h-[4.5rem] text-sm leading-6 text-cyan-50/78">
          {t(`convention.amenities.cruiseSpotlight.options.${key}.description`)}
        </p>
        <div className="mt-auto pt-5">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/66">
            {t("convention.amenities.priceLabel")}
          </p>
          <BulletList
            value={t(
              `convention.amenities.cruiseSpotlight.options.${key}.price`
            )}
            className="mt-2 text-sm font-semibold text-white"
            itemClassName="text-white"
          />
        </div>
      </article>
    ))}
  </div>
);

const MediaPanel = ({ t }: Readonly<{ t: TFunction }>) => (
  <div className="relative min-h-[320px] overflow-hidden border-t border-white/10 lg:min-h-full lg:border-l lg:border-t-0">
    <img
      src={CRUISE_SPOTLIGHT_IMAGE}
      alt={t("convention.amenities.cruiseSpotlight.imageAlt")}
      className="absolute inset-0 h-full w-full object-cover"
      loading="lazy"
    />
    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,14,25,0.12),rgba(7,14,25,0.78)),linear-gradient(135deg,rgba(8,47,73,0.12),rgba(8,47,73,0.6))]" />
    <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
      <div className="rounded-[1.75rem] border border-white/12 bg-slate-950/44 p-5 backdrop-blur-md">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100/72">
          {t("convention.amenities.cruiseSpotlight.panelEyebrow")}
        </p>
        <p className="mt-3 text-lg font-semibold text-white">
          {t("convention.amenities.cruiseSpotlight.panelTitle")}
        </p>
        <p className="mt-2 text-sm leading-6 text-cyan-50/74">
          {t("convention.amenities.cruiseSpotlight.panelDescription")}
        </p>
      </div>
    </div>
  </div>
);

/** Highlights cruise logistics, pricing, and coordination entry point. */
export const CruiseSpotlightBlock = ({ t }: Readonly<{ t: TFunction }>) => (
  <div className="mt-12 overflow-hidden rounded-[2rem] border border-accent/30 bg-[linear-gradient(135deg,rgba(8,47,73,0.92),rgba(18,23,41,0.98))] shadow-[0_28px_70px_-44px_rgba(15,23,42,1)]">
    <div className="grid gap-0 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
      <div className="relative p-6 sm:p-8 lg:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(110,231,255,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(224,117,58,0.14),_transparent_38%)]" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-100/80">
            {t("convention.amenities.cruiseSpotlight.eyebrow")}
          </p>
          <h3 className="mt-3 max-w-xl font-display text-3xl font-semibold text-white sm:text-4xl">
            {t("convention.amenities.cruiseSpotlight.title")}
          </h3>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-cyan-50/78 sm:text-base">
            {t("convention.amenities.cruiseSpotlight.description")}
          </p>

          <LogisticsBanner t={t} />

          <div className="mt-6 flex flex-wrap gap-3">
            {CRUISE_DETAIL_KEYS.map((key) => (
              <div
                key={key}
                className="rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm text-white/88 backdrop-blur"
              >
                <span className="font-semibold">
                  {t(
                    `convention.amenities.cruiseSpotlight.options.${key}.title`
                  )}
                </span>
                {" | "}
                {t(`convention.amenities.cruiseSpotlight.options.${key}.price`)}
              </div>
            ))}
          </div>

          <QuickFacts t={t} />
          <LogisticsGrid t={t} />
          <OptionCards t={t} />

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href={t("convention.amenities.cruiseSpotlight.primaryLinkUrl")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-cyan-100/25 bg-cyan-100/12 px-5 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-cyan-100/18"
              data-content-section="amenities"
              data-content-id="cruise_spotlight_pdf"
            >
              {t("convention.amenities.cruiseSpotlight.primaryLinkLabel")}
            </a>
            <a
              href={t("convention.amenities.cruiseSpotlight.secondaryLinkUrl")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100 underline decoration-dashed underline-offset-4 transition hover:text-white"
              data-content-section="amenities"
              data-content-id="cruise_spotlight_gallery"
            >
              {t("convention.amenities.cruiseSpotlight.secondaryLinkLabel")}
            </a>
          </div>
          <p className="mt-5 max-w-2xl text-xs leading-6 text-cyan-100/68">
            {t("convention.amenities.cruiseSpotlight.note")}
          </p>
        </div>
      </div>

      <MediaPanel t={t} />
    </div>
  </div>
);
