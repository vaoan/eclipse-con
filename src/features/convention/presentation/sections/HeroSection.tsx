import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { Button } from "@/shared/presentation/ui/button";
import { tid } from "@/shared/application/utils/tid";
import { SECTION_IDS } from "@/features/convention/domain/constants";
import { useIsMobileViewport } from "@/shared/application/hooks/useIsMobileViewport";
import { useExperiment } from "@/shared/application/hooks/useExperiment";

const heroBathSingle = "/hero-bath-preview.webp";

const EXPERIMENT_ID = "hero-bath-layout";
const VARIANTS = ["control", "treatment", "pattern"] as const;
type HeroVariant = (typeof VARIANTS)[number];

const heroTextShadow = {
  filter:
    "drop-shadow(0 2px 4px rgba(0,0,0,0.95)) drop-shadow(0 4px 16px rgba(0,0,0,0.75))",
} satisfies React.CSSProperties;

function HeroBathPicture({ className = "" }: { readonly className?: string }) {
  return (
    <img
      src={heroBathSingle}
      alt=""
      aria-hidden="true"
      className={`h-full w-auto select-none object-cover brightness-80 ${className}`}
      loading="eager"
      fetchPriority="high"
      decoding="async"
      draggable={false}
    />
  );
}

function HeroCrescent() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="pointer-events-none absolute"
      style={{
        height: "250%",
        aspectRatio: "1",
        left: "12%",
        top: "50%",
        transform: "translateY(-43%)",
        zIndex: 0,
      }}
    >
      <defs>
        <mask id="hero-crescent-mask">
          <circle cx="250" cy="250" r="220" fill="white" />
          <circle cx="285" cy="238" r="190" fill="black" />
        </mask>
      </defs>
      <circle
        cx="250"
        cy="250"
        r="220"
        fill="white"
        opacity="0.5"
        mask="url(#hero-crescent-mask)"
      />
    </svg>
  );
}

function HeroTextContent({ showCrescent }: { readonly showCrescent: boolean }) {
  const { t } = useTranslation();
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  return (
    <div className="relative z-30 px-4 text-center">
      <div>
        <p
          className="-mb-4 text-xl font-bold italic uppercase tracking-[0.35em] text-white/90 md:-mb-6 md:text-2xl lg:-mb-8 lg:text-3xl"
          style={heroTextShadow}
        >
          {t("convention.hero.eyebrow")}
        </p>
        <div className="relative inline-block">
          {showCrescent && <HeroCrescent />}
          <h1
            className="hero-title relative z-[1] text-[4.5rem] leading-none text-white md:text-[7rem] lg:text-[9rem] xl:text-[10rem] 2xl:text-[12rem]"
            style={heroTextShadow}
          >
            {t("convention.hero.title")}
          </h1>
          {/* Sparkle decorations — two stars at upper-right */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-3 -top-1 z-[1] text-white/90 md:-right-5 lg:-right-7"
            style={{
              fontSize: "clamp(1.2rem, 2.8vw, 2.4rem)",
              filter: "drop-shadow(0 0 6px rgba(255,255,255,0.6))",
            }}
          >
            ✦
          </span>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-6 -top-6 z-[1] text-white/60 md:-right-10 lg:-right-14"
            style={{
              fontSize: "clamp(0.6rem, 1.2vw, 1rem)",
              filter: "drop-shadow(0 0 4px rgba(255,255,255,0.4))",
            }}
          >
            ✦
          </span>
        </div>
        <p
          className="mt-24 text-sm font-semibold uppercase tracking-[0.35em] text-white/90 md:mt-32 md:text-base lg:mt-40"
          style={heroTextShadow}
        >
          {t("convention.hero.date")}
        </p>
      </div>
      <Button
        ref={buttonRef}
        asChild
        variant="glow"
        size="lg"
        className="mt-8 h-auto px-10 py-3.5 text-base"
      >
        <Link
          to={`?section=${encodeURIComponent(SECTION_IDS.REGISTRATION)}`}
          data-funnel-step="view_pricing"
          data-cta-id="hero_primary_cta"
          data-cta-variant="hero_primary"
          data-content-section="hero"
          data-content-id="hero_primary_cta"
          data-content-interaction="open"
        >
          {t("convention.hero.cta")}
        </Link>
      </Button>
    </div>
  );
}

/** Renders the full-screen Hero section with title, tagline, CTA, and mirrored bath illustration.
 * Uses sticky positioning so it stays fixed at the top while content sections scroll over it.
 * No JS scroll listeners — pure CSS layering handles visibility.
 */
export function HeroSection() {
  const isMobileViewport = useIsMobileViewport();
  const variant = useExperiment(
    EXPERIMENT_ID,
    VARIANTS,
    "pattern"
  ) as HeroVariant;

  return (
    <section
      id="section-hero"
      className="sticky top-0 z-0 flex min-h-screen items-center justify-center overflow-hidden"
      {...tid("section-hero")}
    >
      {/* Bath illustration anchored to the bottom — covered naturally by content sections */}
      <div className="absolute bottom-0 left-0 right-0 z-20 overflow-hidden">
        <div className="relative z-0 mx-auto flex h-[390px] items-center justify-center gap-0 sm:h-[460px] md:h-[560px] lg:h-[680px]">
          {!isMobileViewport && <HeroBathPicture className="scale-x-[-1]" />}
          <HeroBathPicture />
          {!isMobileViewport && <HeroBathPicture className="scale-x-[-1]" />}
        </div>
      </div>

      <HeroTextContent showCrescent={variant !== "control"} />
    </section>
  );
}
