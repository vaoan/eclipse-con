import { useTranslation } from "react-i18next";

import { tid } from "@/shared/application/utils/tid";
import { SECTION_IDS } from "@/features/convention/domain/constants";
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
      {/* Background gradient */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#0a0b1a] via-[#111233] to-[#0a0b1a]"
        aria-hidden="true"
      />

      {/* Parallax torii gates */}
      <ParallaxLayer speed={0.15} className="absolute inset-0">
        <div className="absolute bottom-20 left-[5%] opacity-[0.06]">
          <ToriiGateSilhouette className="w-32 text-primary md:w-48" />
        </div>
        <div className="absolute bottom-10 right-[8%] opacity-[0.04]">
          <ToriiGateSilhouette className="w-24 text-accent md:w-36" />
        </div>
      </ParallaxLayer>

      {/* Lantern glow */}
      <div
        className="glow-pulse absolute top-1/4 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl md:h-96 md:w-96"
        aria-hidden="true"
      />

      {/* Content */}
      <ParallaxLayer speed={0.3} className="relative z-20 px-4 text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-accent/80">
          {t("convention.hero.date")}
        </p>
        <h1 className="gold-shimmer-text font-display text-6xl font-extrabold leading-tight md:text-8xl lg:text-9xl">
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
      </ParallaxLayer>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <WavePattern className="opacity-40" />
      </div>
    </section>
  );
}
