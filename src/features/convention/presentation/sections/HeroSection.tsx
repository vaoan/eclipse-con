import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { tid } from "@/shared/application/utils/tid";
import { SECTION_IDS } from "@/features/convention/domain/constants";
import { useIsMobileViewport } from "@/shared/application/hooks/useIsMobileViewport";
import { ParallaxLayer } from "../components/ParallaxLayer";
import { ToriiGateSilhouette } from "../components/ToriiGateSilhouette";
import heroBath from "../assets/hero-bath.png";
import heroBath1600 from "../assets/hero-bath-1600.png";
import heroBath900 from "../assets/hero-bath-900.png";

const HERO_BATH_SRC_SET = `${heroBath900} 900w, ${heroBath1600} 1600w, ${heroBath} 2970w`;
const HERO_BATH_SIZES =
  "(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw";

function HeroBathPicture({ className = "" }: { readonly className?: string }) {
  const pictureClasses = "flex-none h-full";
  const baseClasses = "h-full w-auto select-none object-cover brightness-60";

  return (
    <picture className={pictureClasses}>
      <source
        type="image/png"
        srcSet={HERO_BATH_SRC_SET}
        sizes={HERO_BATH_SIZES}
      />
      <img
        src={heroBath1600}
        alt=""
        className={`${baseClasses} ${className}`}
        loading="lazy"
        decoding="async"
        draggable={false}
      />
    </picture>
  );
}

export function HeroSection() {
  const { t } = useTranslation();
  const isMobileViewport = useIsMobileViewport();
  const bathLayerRef = useRef<HTMLDivElement | null>(null);
  const textLayerRef = useRef<HTMLDivElement | null>(null);

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
  }, []);

  return (
    <section
      id={SECTION_IDS.HERO}
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
      {...tid("section-hero")}
    >
      {/* Parallax torii gates */}
      <ParallaxLayer speed={0.4} className="absolute inset-0">
        <div className="absolute bottom-20 left-[5%] opacity-[0.18]">
          <ToriiGateSilhouette className="w-32 text-primary md:w-48" />
        </div>
        <div className="absolute bottom-10 right-[8%] opacity-[0.14]">
          <ToriiGateSilhouette className="w-24 text-accent md:w-36" />
        </div>
      </ParallaxLayer>

      <div
        ref={bathLayerRef}
        className="absolute bottom-0 left-0 right-0 z-20 overflow-hidden"
      >
        <div className="relative z-0 mx-auto flex h-[330px] items-center justify-center gap-0 sm:h-[400px] md:h-[480px] lg:h-[560px]">
          {!isMobileViewport && <HeroBathPicture className="scale-x-[-1]" />}
          <HeroBathPicture />
          {!isMobileViewport && <HeroBathPicture className="scale-x-[-1]" />}
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
        <a
          href={`#${SECTION_IDS.REGISTRATION}`}
          className="mt-10 inline-block rounded-lg bg-primary px-8 py-3.5 font-bold text-white transition-colors hover:bg-primary-glow"
        >
          {t("convention.hero.cta")}
        </a>
      </div>
    </section>
  );
}
