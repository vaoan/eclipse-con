import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { Button } from "@/shared/presentation/ui/button";
import { tid } from "@/shared/application/utils/tid";
import { SECTION_IDS } from "@/features/convention/domain/constants";
import { useIsMobileViewport } from "@/shared/application/hooks/useIsMobileViewport";

const heroBathSingle = "/hero-bath-preview.webp";

const heroTextShadow = {
  textShadow: "0 2px 4px rgba(0,0,0,0.95), 0 4px 16px rgba(0,0,0,0.75)",
} satisfies React.CSSProperties;

function HeroBathPicture({ className = "" }: { readonly className?: string }) {
  return (
    <img
      src={heroBathSingle}
      alt=""
      aria-hidden="true"
      width={1810}
      height={922}
      className={`h-full w-auto select-none object-cover brightness-80 ${className}`}
      loading="eager"
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

/** SVG path for a 4-pointed star sparkle centred in a 24×24 viewBox. */
const SPARKLE_PATH =
  "M12 0Q13.2 10.8 24 12Q13.2 13.2 12 24Q10.8 13.2 0 12Q10.8 10.8 12 0Z";

function Sparkle({
  size,
  className,
  style,
}: Readonly<{
  size: number;
  className?: string;
  style?: React.CSSProperties;
}>) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      className={className}
      style={style}
    >
      <path d={SPARKLE_PATH} />
    </svg>
  );
}

function HeroSparkles() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute z-[1]"
      style={{
        right: "clamp(-1rem, -1.8vw, -0.5rem)",
        top: "clamp(0.5rem, 1vw, 1rem)",
      }}
    >
      {/* Large sparkle — sits just above-right of the "t" crossbar */}
      <Sparkle
        size={0}
        className="absolute text-white/90"
        style={{
          width: "clamp(1.1rem, 2.6vw, 2.2rem)",
          height: "clamp(1.1rem, 2.6vw, 2.2rem)",
          right: 0,
          top: 0,
          filter: "drop-shadow(0 0 6px rgba(255,255,255,0.6))",
        }}
      />
      {/* Small sparkle — further up and to the right */}
      <Sparkle
        size={0}
        className="absolute text-white/60"
        style={{
          width: "clamp(0.55rem, 1.1vw, 0.95rem)",
          height: "clamp(0.55rem, 1.1vw, 0.95rem)",
          right: "clamp(-0.9rem, -1.6vw, -0.4rem)",
          top: "clamp(1.2rem, 2.8vw, 2.4rem)",
          filter: "drop-shadow(0 0 4px rgba(255,255,255,0.4))",
        }}
      />
    </div>
  );
}

function HeroTextContent() {
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
          <HeroCrescent />
          <h1
            className="hero-title relative z-[1] text-[4.5rem] leading-none text-white md:text-[7rem] lg:text-[9rem] xl:text-[10rem] 2xl:text-[12rem]"
            style={heroTextShadow}
          >
            {t("convention.hero.title")}
          </h1>
          {/* Sparkle decorations — two 4-pointed stars near the "t" */}
          <HeroSparkles />
        </div>
        <p
          className="mt-24 text-base font-semibold uppercase tracking-[0.35em] text-white/90 md:mt-32 md:text-lg lg:mt-40 lg:text-xl"
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
        className="mt-14 h-auto px-10 py-3.5 text-base md:mt-16"
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

  return (
    <section
      id="section-hero"
      className="sticky top-0 z-0 flex min-h-[100dvh] items-center justify-center overflow-hidden will-change-transform"
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

      <HeroTextContent />
    </section>
  );
}
