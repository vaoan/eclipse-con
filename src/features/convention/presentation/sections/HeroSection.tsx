import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { tid } from "@/shared/application/utils/tid";
import { SECTION_IDS } from "@/features/convention/domain/constants";
import { useIsMobileViewport } from "@/shared/application/hooks/useIsMobileViewport";
import { useExperiment } from "@/shared/application/hooks/useExperiment";
const heroBathSingle = "/hero-bath-preview.webp";
const heroPattern = "/patron-nuevo.webp";

const EXPERIMENT_ID = "hero-bath-layout";
const VARIANTS = ["control", "treatment", "pattern"] as const;
type HeroVariant = (typeof VARIANTS)[number];

function HeroBathPicture({ className = "" }: { readonly className?: string }) {
  const baseClasses = "h-full w-auto select-none object-cover brightness-80";

  return (
    <img
      src={heroBathSingle}
      alt=""
      aria-hidden="true"
      className={`${baseClasses} ${className}`}
      loading="eager"
      fetchPriority="high"
      decoding="async"
      draggable={false}
    />
  );
}

const useHeroClipOverlap = (
  bathLayerRef: React.RefObject<HTMLDivElement | null>,
  textLayerRef: React.RefObject<HTMLDivElement | null>
) => {
  useEffect(() => {
    let frame = 0;

    const applyClipFromOverlap = (
      element: HTMLDivElement | null,
      coverTop: number
    ) => {
      if (!element) {
        return;
      }

      const bounds = element.getBoundingClientRect();
      const hiddenByCover = Math.max(0, bounds.bottom - coverTop);
      const cutPx = Math.min(bounds.height, hiddenByCover);
      const clipValue = `inset(0 0 ${cutPx.toFixed(2)}px 0)`;
      element.style.clipPath = clipValue;
      element.style.setProperty("-webkit-clip-path", clipValue);
    };

    const updateClipping = () => {
      frame = 0;
      const nextSection = document.getElementById(SECTION_IDS.ABOUT);
      if (!nextSection) {
        return;
      }

      const nextTop = nextSection.getBoundingClientRect().top;
      applyClipFromOverlap(bathLayerRef.current, nextTop);
      applyClipFromOverlap(textLayerRef.current, nextTop);
    };

    const onScrollOrResize = () => {
      if (frame) {
        return;
      }
      frame = window.requestAnimationFrame(updateClipping);
    };

    updateClipping();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("orientationchange", onScrollOrResize);
    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("orientationchange", onScrollOrResize);
    };
  }, [bathLayerRef, textLayerRef]);
};

export function HeroSection() {
  const { t } = useTranslation();
  const isMobileViewport = useIsMobileViewport();
  const bathLayerRef = useRef<HTMLDivElement | null>(null);
  const textLayerRef = useRef<HTMLDivElement | null>(null);
  const variant = useExperiment(
    EXPERIMENT_ID,
    VARIANTS,
    "treatment"
  ) as HeroVariant;
  useHeroClipOverlap(bathLayerRef, textLayerRef);

  return (
    <section
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
      {...tid("section-hero")}
    >
      {/* Treatment / Pattern: repeating decorative pattern */}
      {(variant === "treatment" || variant === "pattern") && (
        <div
          aria-hidden="true"
          className={`absolute inset-0 z-0 brightness-80${variant === "treatment" ? " opacity-20" : ""}`}
          style={{
            backgroundImage: `url("${heroPattern}")`,
            backgroundRepeat: "repeat",
            backgroundSize: "320px auto",
          }}
        />
      )}

      <div
        ref={bathLayerRef}
        className="absolute bottom-0 left-0 right-0 z-20 overflow-hidden"
      >
        <div className="relative z-0 mx-auto flex h-[390px] items-center justify-center gap-0 sm:h-[460px] md:h-[560px] lg:h-[680px]">
          {variant === "control" && !isMobileViewport && (
            <HeroBathPicture className="scale-x-[-1]" />
          )}
          <HeroBathPicture />
          {variant === "control" && !isMobileViewport && (
            <HeroBathPicture className="scale-x-[-1]" />
          )}
        </div>
      </div>

      <div ref={textLayerRef} className="relative z-30 px-4 text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-accent/80">
          {t("convention.hero.date")}
        </p>
        <h1 className="hero-title gold-shimmer-text text-6xl font-extrabold leading-tight md:text-8xl lg:text-9xl">
          {t("convention.hero.title")}
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-lg text-foreground/70 md:text-xl">
          {t("convention.hero.tagline")}
        </p>
        <Button
          asChild
          size="lg"
          className="group relative mt-10 h-auto rounded-full bg-gradient-to-r from-accent via-primary to-primary px-10 py-3.5 text-base font-bold text-white ring-1 ring-white/25 transition-all duration-300 hover:-translate-y-1"
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
            <span className="pointer-events-none absolute -inset-2 -z-10 rounded-full bg-[radial-gradient(circle,rgba(255,198,100,0.45),transparent_60%)] opacity-70 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
            <span className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.35),transparent_55%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <span className="relative">{t("convention.hero.cta")}</span>
            <span className="relative text-base text-white/70 transition-transform duration-300 group-hover:translate-x-1">
              -&gt;
            </span>
          </Link>
        </Button>
      </div>
    </section>
  );
}
