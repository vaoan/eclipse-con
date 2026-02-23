import { useTranslation } from "react-i18next";

import { SECTION_IDS } from "@/features/convention/domain/constants";
import { EVENTS } from "@/features/convention/application/data/events";
import { CloudSilhouette } from "../components/CloudSilhouette";
import { CraneSilhouette } from "../components/CraneSilhouette";
import { EventCard } from "../components/EventCard";
import { LanternSilhouette } from "../components/LanternSilhouette";
import { MountainSilhouette } from "../components/MountainSilhouette";
import { SectionParallaxLayer } from "../components/SectionParallaxLayer";
import { SectionWrapper } from "../components/SectionWrapper";

const EVENTS_DECORATIONS = (
  <>
    <SectionParallaxLayer
      speed={0.12}
      className="pointer-events-none absolute inset-0"
    >
      <div className="float-gentle absolute top-[15%] left-[8%] w-8 opacity-[0.12] md:w-12">
        <LanternSilhouette className="text-primary" />
      </div>
      <div className="float-gentle absolute top-[30%] right-[12%] w-6 opacity-[0.08] md:w-10">
        <LanternSilhouette className="text-accent" />
      </div>
    </SectionParallaxLayer>
    <SectionParallaxLayer
      speed={-0.08}
      className="pointer-events-none absolute inset-0"
    >
      <div className="float-gentle absolute top-[50%] left-[88%] w-10 opacity-[0.1] md:w-14">
        <LanternSilhouette className="text-sakura" />
      </div>
      <div
        className="float-gentle absolute top-[65%] left-[3%] w-5 opacity-[0.06] md:w-8"
        style={{ animationDelay: "2s" }}
      >
        <LanternSilhouette className="text-accent" />
      </div>
    </SectionParallaxLayer>
    <SectionParallaxLayer
      speed={0.04}
      className="pointer-events-none absolute inset-0"
    >
      <div className="absolute bottom-0 left-[5%] right-[5%] h-px bg-gradient-to-r from-transparent via-accent/10 to-transparent" />
      <div className="absolute bottom-4 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-accent/5 to-transparent" />
      <div className="drift-cloud absolute top-[8%] right-[20%] w-20 opacity-[0.03] md:w-28">
        <CloudSilhouette className="text-foreground" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 opacity-[0.04]">
        <MountainSilhouette variant="far" className="text-accent" />
      </div>
    </SectionParallaxLayer>
    <SectionParallaxLayer
      speed={0.06}
      className="pointer-events-none absolute inset-0"
    >
      <div className="drift-cloud absolute top-[18%] left-[65%] w-10 opacity-[0.05] md:w-14">
        <CraneSilhouette className="text-accent" />
      </div>
      <div
        className="drift-cloud absolute top-[25%] left-[75%] w-7 opacity-[0.03] md:w-10"
        style={{ animationDelay: "4s" }}
      >
        <CraneSilhouette className="text-accent" />
      </div>
      <svg
        viewBox="0 0 1200 600"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <circle
          cx="150"
          cy="80"
          r="1"
          fill="var(--color-accent)"
          opacity="0.12"
        />
        <circle
          cx="350"
          cy="130"
          r="0.8"
          fill="var(--color-accent)"
          opacity="0.08"
        />
        <circle
          cx="950"
          cy="60"
          r="1"
          fill="var(--color-accent)"
          opacity="0.1"
        />
        <circle
          cx="1050"
          cy="150"
          r="0.8"
          fill="var(--color-accent)"
          opacity="0.06"
        />
        <circle
          cx="750"
          cy="100"
          r="0.6"
          fill="var(--color-accent)"
          opacity="0.08"
        />
      </svg>
    </SectionParallaxLayer>
  </>
);

export function EventsSection() {
  const { t } = useTranslation();

  return (
    <SectionWrapper id={SECTION_IDS.EVENTS} decorations={EVENTS_DECORATIONS}>
      <div className="text-center">
        <h2 className="font-display text-4xl font-bold text-foreground md:text-5xl">
          {t("convention.events.title")}
        </h2>
        <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-accent" />
        <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
          {t("convention.events.subtitle")}
        </p>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {EVENTS.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </SectionWrapper>
  );
}
