import { useTranslation } from "react-i18next";

import { SECTION_IDS } from "@/features/convention/domain/constants";
import { FAQ_ITEMS } from "@/features/convention/application/data/faqItems";
import { CloudSilhouette } from "../components/CloudSilhouette";
import { CraneSilhouette } from "../components/CraneSilhouette";
import { FaqAccordionItem } from "../components/FaqAccordionItem";
import { LanternSilhouette } from "../components/LanternSilhouette";
import { MountainSilhouette } from "../components/MountainSilhouette";
import { SectionParallaxLayer } from "../components/SectionParallaxLayer";
import { SectionWrapper } from "../components/SectionWrapper";

export function FaqSection() {
  const { t } = useTranslation();

  return (
    <SectionWrapper
      id={SECTION_IDS.FAQ}
      className="bg-surface"
      decorations={
        <>
          <SectionParallaxLayer
            speed={0.1}
            className="pointer-events-none absolute inset-0"
          >
            <div className="absolute left-2 top-[5%] h-[85%] w-1.5 rounded-full bg-accent opacity-[0.06]" />
            <div className="absolute left-6 top-[15%] h-[70%] w-1 rounded-full bg-accent opacity-[0.04]" />
          </SectionParallaxLayer>
          <SectionParallaxLayer
            speed={-0.08}
            className="pointer-events-none absolute inset-0"
          >
            <div className="absolute right-2 top-[8%] h-[75%] w-1 rounded-full bg-accent opacity-[0.05]" />
            <div className="absolute right-5 top-[18%] h-[60%] w-1.5 rounded-full bg-accent opacity-[0.04]" />
            <div className="absolute right-8 top-[12%] h-[70%] w-0.5 rounded-full bg-accent opacity-[0.03]" />
          </SectionParallaxLayer>
          <SectionParallaxLayer
            speed={0.12}
            className="pointer-events-none absolute inset-0"
          >
            <div className="float-gentle absolute top-[25%] right-[12%] w-6 opacity-[0.08]">
              <LanternSilhouette className="text-accent" />
            </div>
            <div className="absolute top-[60%] left-[10%] h-2.5 w-5 rotate-[30deg] rounded-[50%_50%_50%_0] bg-sakura/[0.06]" />
            <div className="absolute top-[40%] right-[20%] h-2 w-4 rotate-[-20deg] rounded-[50%_50%_50%_0] bg-accent/[0.05]" />
            <div className="absolute top-[75%] left-[25%] h-2 w-4 rotate-[60deg] rounded-[50%_50%_50%_0] bg-accent/[0.04]" />
            <div className="drift-cloud absolute top-[10%] left-[40%] w-16 opacity-[0.03] md:w-24">
              <CloudSilhouette className="text-foreground" />
            </div>
          </SectionParallaxLayer>
          <SectionParallaxLayer
            speed={0.04}
            className="pointer-events-none absolute inset-0"
          >
            <div className="absolute bottom-0 left-0 right-0 opacity-[0.04]">
              <MountainSilhouette variant="far" className="text-accent" />
            </div>
            <div className="drift-cloud absolute top-[15%] right-[25%] w-12 opacity-[0.05] md:w-16">
              <CraneSilhouette className="text-accent" />
            </div>
            <div
              className="drift-cloud absolute top-[22%] right-[38%] w-8 opacity-[0.03] md:w-10"
              style={{ animationDelay: "5s" }}
            >
              <CraneSilhouette className="text-accent" />
            </div>
          </SectionParallaxLayer>
        </>
      }
    >
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <h2 className="font-display text-4xl font-bold text-foreground md:text-5xl">
            {t("convention.faq.title")}
          </h2>
          <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-accent" />
        </div>
        <div className="mt-12">
          {FAQ_ITEMS.map((item) => (
            <FaqAccordionItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
