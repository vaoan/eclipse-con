import { useTranslation } from "react-i18next";

import { tid } from "@/shared/application/utils/tid";
import { SECTION_IDS } from "@/features/convention/domain/constants";
import { EclipseMoon } from "../components/EclipseMoon";
import { ParallaxLayer } from "../components/ParallaxLayer";
import { ToriiGateSilhouette } from "../components/ToriiGateSilhouette";
import { WavePattern } from "../components/WavePattern";

export function HeroSection() {
  const { t } = useTranslation();

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
      <ParallaxLayer speed={0.05} className="absolute inset-0">
        <div className="absolute top-[15%] left-[20%] h-1.5 w-1.5 rounded-full bg-accent/30" />
        <div className="absolute top-[25%] left-[60%] h-1 w-1 rounded-full bg-accent/20" />
        <div className="absolute top-[40%] left-[35%] h-1 w-1 rounded-full bg-accent/25" />
        <div className="absolute top-[10%] left-[80%] h-0.5 w-0.5 rounded-full bg-accent/15" />
        <div className="absolute top-[55%] left-[15%] h-1 w-1 rounded-full bg-accent/20" />
        <div className="absolute top-[35%] left-[90%] h-1.5 w-1.5 rounded-full bg-accent/20" />
        <div className="absolute top-[65%] left-[50%] h-1 w-1 rounded-full bg-accent/15" />
        <div className="absolute top-[20%] left-[45%] h-0.5 w-0.5 rounded-full bg-accent/20" />
        <div className="absolute top-[75%] left-[70%] h-1 w-1 rounded-full bg-accent/25" />
        <div className="absolute top-[45%] left-[75%] h-1.5 w-1.5 rounded-full bg-accent/15" />
        <div className="absolute top-[30%] left-[12%] h-0.5 w-0.5 rounded-full bg-accent/25" />
        <div
          className="absolute top-[18%] left-[30%] h-px w-16 rotate-[35deg] bg-gradient-to-r from-transparent via-accent/40 to-transparent"
          style={{ animation: "shooting-star 8s 3s linear infinite" }}
        />
      </ParallaxLayer>

      {/* Deep background glows */}
      <ParallaxLayer speed={0.08} className="absolute inset-0">
        <div className="absolute top-[60%] right-[20%] h-48 w-48 rounded-full bg-primary/5 blur-3xl md:h-72 md:w-72" />
        <div className="absolute top-[30%] left-[10%] h-32 w-32 rounded-full bg-accent/[0.03] blur-3xl md:h-48 md:w-48" />
      </ParallaxLayer>

      {/* Eclipse moon — centered over title as focal point */}
      <ParallaxLayer speed={0.1} className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 w-72 -translate-x-1/2 -translate-y-[65%] md:w-96 lg:w-[28rem]">
          <EclipseMoon />
        </div>
      </ParallaxLayer>

      {/* Lantern glow */}
      <ParallaxLayer speed={0.25} className="absolute inset-0">
        <div
          className="glow-pulse absolute top-1/4 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl md:h-96 md:w-96"
          aria-hidden="true"
        />
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

      <div className="relative z-20 px-4 text-center">
        <img
          src="https://moonfest-b63fa.web.app/assets/moonfest/moonfest-logotipo.svg"
          alt={t("convention.hero.logoAlt")}
          className="mx-auto mb-6 w-40 md:w-56"
          loading="lazy"
        />
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

      <div className="absolute bottom-0 left-0 right-0 z-20">
        <WavePattern className="opacity-40" />
      </div>
    </section>
  );
}
