import { useTranslation } from "react-i18next";

import { HeroCanvasSky } from "./HeroCanvasSky";

const crescentMoonAsset = "/crescent-moon.svg";

const textShadow = {
  textShadow: "0 2px 4px rgba(0,0,0,0.95), 0 4px 16px rgba(0,0,0,0.75)",
} satisfies React.CSSProperties;

/** Sticky ambient background layer that sits between the hero and content sections.
 * Has its own opaque background to fully cover the hero beneath it.
 * Mirrors the hero's "FURRY" eyebrow, title, and date with matching sizes and colors.
 * Visible through semi-transparent ("elevated") content sections;
 * fully covered by opaque ("deep") content sections via CSS stacking alone.
 */
export function PostHeroBackground() {
  const { t } = useTranslation();

  return (
    <div
      className="pointer-events-none sticky top-0 z-[1] flex h-[100dvh] items-center justify-center will-change-transform"
      aria-hidden="true"
    >
      <HeroCanvasSky className="z-0" />
      <div className="relative z-[1] flex flex-col items-center opacity-[0.14]">
        <p
          className="-mb-4 text-xl font-bold italic uppercase tracking-[0.35em] text-white/90 md:-mb-6 md:text-2xl lg:-mb-8 lg:text-3xl"
          style={textShadow}
        >
          {t("convention.hero.eyebrow")}
        </p>
        <div className="relative inline-block">
          <img
            src={crescentMoonAsset}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute"
            style={{
              height: "250%",
              aspectRatio: "1",
              left: "12%",
              top: "50%",
              transform: "translateY(-43%)",
              zIndex: 0,
              opacity: 0.5,
            }}
          />
          <p
            className="hero-title relative z-[1] text-[4.5rem] leading-none text-white md:text-[7rem] lg:text-[9rem] xl:text-[10rem] 2xl:text-[12rem]"
            style={textShadow}
          >
            {t("convention.hero.title")}
          </p>
        </div>
      </div>
    </div>
  );
}
