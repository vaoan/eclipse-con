import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";

import { tid } from "@/shared/application/utils/tid";
import { SECTION_IDS } from "@/features/convention/domain/constants";
import { useParallax } from "@/features/convention/application/hooks/useParallax";
import { useIsMobileViewport } from "@/shared/application/hooks/useIsMobileViewport";
import { EclipseMoon } from "../components/EclipseMoon";
import { ParallaxLayer } from "../components/ParallaxLayer";
import { ToriiGateSilhouette } from "../components/ToriiGateSilhouette";
import heroBath from "../assets/hero-bath.png";
import heroBath1600 from "../assets/hero-bath-1600.png";
import heroBath900 from "../assets/hero-bath-900.png";

const SHOOTING_STARS = [
  {
    top: "12%",
    left: "8%",
    delay: "0s",
    duration: "3.2s",
    tail: "140px",
    shine: "36px",
  },
  {
    top: "28%",
    left: "32%",
    delay: "1.4s",
    duration: "3.6s",
    tail: "170px",
    shine: "42px",
  },
  {
    top: "46%",
    left: "18%",
    delay: "2.1s",
    duration: "4s",
    tail: "150px",
    shine: "34px",
  },
  {
    top: "18%",
    left: "62%",
    delay: "2.8s",
    duration: "3.4s",
    tail: "180px",
    shine: "40px",
  },
  {
    top: "62%",
    left: "44%",
    delay: "3.6s",
    duration: "3.9s",
    tail: "160px",
    shine: "38px",
  },
  {
    top: "36%",
    left: "76%",
    delay: "4.4s",
    duration: "3.3s",
    tail: "190px",
    shine: "44px",
  },
  {
    top: "8%",
    left: "52%",
    delay: "5.1s",
    duration: "3.7s",
    tail: "150px",
    shine: "34px",
  },
  {
    top: "70%",
    left: "12%",
    delay: "5.8s",
    duration: "4.1s",
    tail: "175px",
    shine: "40px",
  },
];

const STAR_SPARKS = [
  {
    className:
      "hero-star-spark absolute top-[15%] left-[20%] h-1.5 w-1.5 rounded-full bg-[#e6f4ff]",
    delay: "0.5s",
  },
  {
    className:
      "hero-star-spark absolute top-[25%] left-[60%] h-1 w-1 rounded-full bg-[#cfe7ff]",
    delay: "2.2s",
  },
  {
    className:
      "hero-star-spark absolute top-[40%] left-[35%] h-1 w-1 rounded-full bg-[#e8f6ff]",
    delay: "1.4s",
  },
  {
    className:
      "hero-star-spark absolute top-[10%] left-[80%] h-0.5 w-0.5 rounded-full bg-[#d7ecff]",
    delay: "3.1s",
  },
  {
    className:
      "hero-star-spark absolute top-[55%] left-[15%] h-1 w-1 rounded-full bg-[#d9f0ff]",
    delay: "0.9s",
  },
  {
    className:
      "hero-star-spark absolute top-[35%] left-[90%] h-1.5 w-1.5 rounded-full bg-[#e6f4ff]",
    delay: "2.8s",
  },
  {
    className:
      "hero-star-spark absolute top-[65%] left-[50%] h-1 w-1 rounded-full bg-[#cfe7ff]",
    delay: "4.6s",
  },
  {
    className:
      "hero-star-spark absolute top-[20%] left-[45%] h-0.5 w-0.5 rounded-full bg-[#d9f0ff]",
    delay: "1.8s",
  },
  {
    className:
      "hero-star-spark absolute top-[75%] left-[70%] h-1 w-1 rounded-full bg-[#e8f6ff]",
    delay: "3.6s",
  },
  {
    className:
      "hero-star-spark absolute top-[45%] left-[75%] h-1.5 w-1.5 rounded-full bg-[#cfe7ff]",
    delay: "5.2s",
  },
  {
    className:
      "hero-star-spark absolute top-[30%] left-[12%] h-0.5 w-0.5 rounded-full bg-[#e6f4ff]",
    delay: "2.5s",
  },
];

const HERO_BATH_SRC_SET = `${heroBath900} 900w, ${heroBath1600} 1600w, ${heroBath} 2970w`;
const HERO_BATH_SIZES =
  "(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw";

function HeroBathPicture({ className = "" }: { readonly className?: string }) {
  const pictureClasses = "flex-none h-full";
  const baseClasses = "h-full w-auto select-none object-cover brightness-60";

  return (
    <picture className={pictureClasses}>
      <source type="image/png" srcSet={HERO_BATH_SRC_SET} sizes={HERO_BATH_SIZES} />
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

function HeroStarField() {
  return (
    <ParallaxLayer speed={0.05} className="absolute inset-0">
      <div className="hero-starfield hero-starfield--far" aria-hidden="true" />
      <div className="hero-starfield hero-starfield--mid" aria-hidden="true" />
      <div className="hero-starfield hero-starfield--near" aria-hidden="true" />
      <div className="hero-star-spray hero-star-spray--bright" />
      <div className="hero-star-spray hero-star-spray--soft" />
      {STAR_SPARKS.map((spark) => (
        <div
          key={spark.className}
          className={spark.className}
          style={{ animationDelay: spark.delay }}
        />
      ))}
      <div
        className="absolute top-[18%] left-[30%] h-px w-16 rotate-[35deg] bg-gradient-to-r from-transparent via-accent/40 to-transparent"
        style={{ animation: "shooting-star 8s 3s linear infinite" }}
      />
      <div className="hero-night" aria-hidden="true">
        {SHOOTING_STARS.map((star, index) => (
          <span
            key={`shooting-star-${index}`}
            className="hero-shooting-star"
            style={
              {
                "--top": star.top,
                "--left": star.left,
                "--delay": star.delay,
                "--duration": star.duration,
                "--tail": star.tail,
                "--shine": star.shine,
              } as CSSProperties
            }
          />
        ))}
      </div>
    </ParallaxLayer>
  );
}

export function HeroSection() {
  const { t } = useTranslation();
  const moonOffset = useParallax(0.08);
  const isMobileViewport = useIsMobileViewport();

  return (
    <section
      id={SECTION_IDS.HERO}
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
      {...tid("section-hero")}
    >
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#0a0b1a] via-[#111233] to-[#0a0b1a]"
        aria-hidden="true"
      />

      {/* Star field + shooting star */}
      <HeroStarField />

      {/* Overall hero glow wash for sky + banner */}
      <div className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(circle_at_50%_38%,_rgba(255,214,140,0.25),_rgba(10,12,30,0)_50%,_rgba(6,8,22,0.7)_100%)] glow-breathe" />

      {/* Eclipse moon — behind the hero photos */}
      <ParallaxLayer speed={0.1} className="absolute inset-0 z-[5]">
        <div
          className="absolute top-1/2 left-1/2 w-72 -translate-x-1/2 -translate-y-[65%] md:w-96 lg:w-[28rem]"
          style={{ transform: `translate3d(0, ${moonOffset}px, 0)` }}
        >
          <EclipseMoon />
        </div>
      </ParallaxLayer>

      {/* Parallax torii gates */}
      <ParallaxLayer speed={0.4} className="absolute inset-0">
        <div className="absolute bottom-20 left-[5%] opacity-[0.18]">
          <ToriiGateSilhouette className="w-32 text-primary md:w-48" />
        </div>
        <div className="absolute bottom-10 right-[8%] opacity-[0.14]">
          <ToriiGateSilhouette className="w-24 text-accent md:w-36" />
        </div>
      </ParallaxLayer>

      <div className="absolute bottom-0 left-0 right-0 z-20 overflow-hidden">
        <div className="relative z-0 mx-auto flex h-[330px] items-center justify-center gap-0 sm:h-[400px] md:h-[480px] lg:h-[560px]">
          {!isMobileViewport && (
            <HeroBathPicture className="scale-x-[-1]" />
          )}
          <HeroBathPicture />
          {!isMobileViewport && (
            <HeroBathPicture className="scale-x-[-1]" />
          )}
        </div>
      </div>

      <div className="relative z-30 px-4 text-center">
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
