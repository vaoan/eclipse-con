import { useTranslation } from "react-i18next";

import { SECTION_IDS } from "@/features/convention/domain/constants";
import { GUESTS } from "@/features/convention/application/data/guests";
import { BakenekoSilhouette } from "../components/BakenekoSilhouette";
import { CraneSilhouette } from "../components/CraneSilhouette";
import { GuestCard } from "../components/GuestCard";
import { KoiSilhouette } from "../components/KoiSilhouette";
import { SectionParallaxLayer } from "../components/SectionParallaxLayer";
import { SectionWrapper } from "../components/SectionWrapper";
import { TanukiSilhouette } from "../components/TanukiSilhouette";

export function GuestsSection() {
  const { t } = useTranslation();

  return (
    <SectionWrapper
      id={SECTION_IDS.GUESTS}
      className="bg-surface"
      decorations={
        <>
          {/* Enormous koi diving in from the top-left */}
          <SectionParallaxLayer
            speed={0.08}
            className="pointer-events-none absolute inset-0"
          >
            <div className="absolute -top-[8%] -left-[20%] w-[24rem] -rotate-[18deg] opacity-[0.05] md:w-[44rem]">
              <div className="swim-drift">
                <KoiSilhouette className="text-primary" />
              </div>
            </div>
          </SectionParallaxLayer>
          {/* Second koi — flipped, swooping out bottom-right */}
          <SectionParallaxLayer
            speed={-0.06}
            className="pointer-events-none absolute inset-0"
          >
            <div
              className="absolute -bottom-[15%] -right-[18%] w-[20rem] opacity-[0.04] md:w-[38rem]"
              style={{ transform: "scaleX(-1) rotate(15deg)" }}
            >
              <div className="swim-drift" style={{ animationDelay: "4s" }}>
                <KoiSilhouette className="text-accent" />
              </div>
            </div>
          </SectionParallaxLayer>
          {/* Bakeneko — massive, peeking down from top-right corner */}
          <SectionParallaxLayer
            speed={0.05}
            className="pointer-events-none absolute inset-0"
          >
            <div
              className="float-gentle absolute -top-[25%] -right-[12%] w-[16rem] -rotate-[10deg] opacity-[0.04] md:w-[30rem]"
              style={{ animationDelay: "1s" }}
            >
              <BakenekoSilhouette className="text-primary" />
            </div>
          </SectionParallaxLayer>
          {/* Tanuki rolling in from bottom-left, tilted playfully */}
          <SectionParallaxLayer
            speed={-0.04}
            className="pointer-events-none absolute inset-0"
          >
            <div
              className="sway-gentle absolute -bottom-[30%] -left-[10%] w-[18rem] rotate-[15deg] opacity-[0.045] md:w-[34rem]"
              style={{ animationDelay: "2s" }}
            >
              <TanukiSilhouette className="text-sakura" />
            </div>
          </SectionParallaxLayer>
          {/* Cranes gliding across the middle-right */}
          <SectionParallaxLayer
            speed={0.03}
            className="pointer-events-none absolute inset-0"
          >
            <div className="drift-cloud absolute top-[30%] -right-[6%] w-[10rem] opacity-[0.045] md:w-[18rem]">
              <CraneSilhouette className="text-accent" />
            </div>
            <div
              className="drift-cloud absolute top-[45%] -right-[3%] w-[7rem] opacity-[0.035] md:w-[13rem]"
              style={{ animationDelay: "3s" }}
            >
              <CraneSilhouette className="text-foreground" />
            </div>
          </SectionParallaxLayer>
        </>
      }
    >
      <div className="text-center">
        <h2 className="font-display text-4xl font-bold text-foreground md:text-5xl">
          {t("convention.guests.title")}
        </h2>
        <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-accent" />
        <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
          {t("convention.guests.subtitle")}
        </p>
      </div>
      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {GUESTS.map((guest) => (
          <GuestCard key={guest.id} guest={guest} />
        ))}
      </div>
    </SectionWrapper>
  );
}
