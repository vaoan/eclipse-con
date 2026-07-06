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

/** Path to the Moonfest logo SVG in /public. */
const MOONFEST_LOGO_SRC = "/Moonfest_Logo_01.svg";

function HeroTextContent() {
  const { t } = useTranslation();
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  return (
    <div className="relative z-30 px-4 text-center">
      <div>
        <img
          src={MOONFEST_LOGO_SRC}
          alt={`${t("convention.hero.eyebrow")} ${t("convention.hero.title")}`}
          className="hero-title w-[20rem] md:w-[32rem] lg:w-[42rem] xl:w-[48rem] 2xl:w-[56rem]"
          style={{
            filter:
              "drop-shadow(0 2px 4px rgba(0,0,0,0.95)) drop-shadow(0 4px 16px rgba(0,0,0,0.75))",
          }}
          loading="eager"
          draggable={false}
        />
        <p
          className="mt-6 text-base font-semibold uppercase tracking-[0.35em] text-white/90 md:mt-8 md:text-lg lg:mt-10 lg:text-xl"
          style={heroTextShadow}
        >
          {t("convention.hero.date")}
        </p>
      </div>
      <Button
        ref={buttonRef}
        asChild
        variant="ghost"
        size="lg"
        className="relative mt-6 h-auto overflow-hidden rounded-full bg-accent px-10 py-3.5 text-base font-black uppercase tracking-[0.22em] text-accent-foreground transition-all duration-300 before:absolute before:inset-0 before:-translate-x-full before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)] before:transition-transform before:duration-700 hover:scale-[1.015] hover:bg-accent hover:brightness-110 hover:text-accent-foreground hover:before:translate-x-full focus-visible:ring-accent/90 md:mt-8"
      >
        <Link
          to={`?section=${encodeURIComponent(SECTION_IDS.REGISTRATION)}`}
          replace
          data-funnel-step="view_pricing"
          data-cta-id="hero_primary_cta"
          data-cta-variant="hero_primary"
          data-content-section="hero"
          data-content-id="hero_primary_cta"
          data-content-interaction="open"
          {...tid("hero-primary-cta")}
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
