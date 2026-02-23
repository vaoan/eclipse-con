import { useTranslation } from "react-i18next";

import { SECTION_IDS } from "@/features/convention/domain/constants";
import { BakenekoSilhouette } from "../components/BakenekoSilhouette";
import { CraneSilhouette } from "../components/CraneSilhouette";
import { KitsuneSilhouette } from "../components/KitsuneSilhouette";
import { SectionParallaxLayer } from "../components/SectionParallaxLayer";
import { SectionWrapper } from "../components/SectionWrapper";
import { TanukiSilhouette } from "../components/TanukiSilhouette";

export function AboutSection() {
  const { t } = useTranslation();

  return (
    <SectionWrapper
      id={SECTION_IDS.ABOUT}
      className="bg-surface"
      decorations={
        <>
          {/* Massive sitting fox — only ears and head peek from bottom-right */}
          <SectionParallaxLayer
            speed={0.06}
            className="pointer-events-none absolute inset-0"
          >
            <div className="float-gentle absolute -bottom-[30%] -right-[10%] w-[22rem] opacity-[0.05] md:w-[40rem]">
              <KitsuneSilhouette className="text-accent" />
            </div>
          </SectionParallaxLayer>
          {/* Big tanuki tumbling in from top-left, upside-down and playful */}
          <SectionParallaxLayer
            speed={-0.04}
            className="pointer-events-none absolute inset-0"
          >
            <div
              className="sway-gentle absolute -top-[35%] -left-[12%] w-[18rem] rotate-[20deg] opacity-[0.045] md:w-[34rem]"
              style={{ animationDelay: "1s" }}
            >
              <TanukiSilhouette className="text-sakura" />
            </div>
          </SectionParallaxLayer>
          {/* Bakeneko stretching in from the right, tall and curious */}
          <SectionParallaxLayer
            speed={0.08}
            className="pointer-events-none absolute inset-0"
          >
            <div
              className="float-gentle absolute top-[10%] -right-[18%] w-[14rem] opacity-[0.04] md:w-[26rem]"
              style={{ animationDelay: "2s" }}
            >
              <BakenekoSilhouette className="text-primary" />
            </div>
          </SectionParallaxLayer>
          {/* Crane soaring across the bottom */}
          <SectionParallaxLayer
            speed={0.03}
            className="pointer-events-none absolute inset-0"
          >
            <div
              className="drift-cloud absolute -bottom-[6%] left-[5%] w-[12rem] -rotate-6 opacity-[0.04] md:w-[22rem]"
              style={{ animationDelay: "3s" }}
            >
              <CraneSilhouette className="text-accent" />
            </div>
          </SectionParallaxLayer>
        </>
      }
    >
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-display text-4xl font-bold text-foreground md:text-5xl">
          {t("convention.about.title")}
        </h2>
        <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-accent" />
        <p className="mt-8 text-lg leading-relaxed text-muted-foreground">
          {t("convention.about.paragraph1")}
        </p>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          {t("convention.about.paragraph2")}
        </p>
        <p className="font-display mt-8 text-xl font-medium text-accent italic">
          {t("convention.about.highlight")}
        </p>
      </div>
    </SectionWrapper>
  );
}
