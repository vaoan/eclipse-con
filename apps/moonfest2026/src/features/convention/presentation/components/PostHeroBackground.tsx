import { HeroCanvasSky } from "./HeroCanvasSky";

/** Path to the Moonfest logo SVG in /public. */
const MOONFEST_LOGO_SRC = "/Moonfest_Logo_01.svg";

/** Sticky ambient background layer that sits between the hero and content sections.
 * Has its own opaque background to fully cover the hero beneath it.
 * Mirrors the hero's logo with matching sizes and colors.
 * Visible through semi-transparent ("elevated") content sections;
 * fully covered by opaque ("deep") content sections via CSS stacking alone.
 */
export function PostHeroBackground() {
  return (
    <div
      className="pointer-events-none sticky top-0 z-[1] flex h-[100dvh] items-center justify-center will-change-transform"
      aria-hidden="true"
    >
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_bottom,#01020a_0%,#040824_18%,#09133a_44%,#060c26_72%,#02040d_100%)]" />
      <HeroCanvasSky className="z-[1]" />
      <div className="relative z-[2] flex flex-col items-center opacity-[0.14]">
        <img
          src={MOONFEST_LOGO_SRC}
          alt=""
          className="hero-title w-[20rem] md:w-[32rem] lg:w-[42rem] xl:w-[48rem] 2xl:w-[56rem]"
          style={{
            filter:
              "drop-shadow(0 2px 4px rgba(0,0,0,0.95)) drop-shadow(0 4px 16px rgba(0,0,0,0.75))",
          }}
          draggable={false}
        />
      </div>
    </div>
  );
}
