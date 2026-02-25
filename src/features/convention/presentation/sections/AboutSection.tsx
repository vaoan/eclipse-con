import { useTranslation } from "react-i18next";

import { SECTION_IDS } from "@/features/convention/domain/constants";
import { SectionHeader } from "../components/SectionHeader";
import { SectionWrapper } from "../components/SectionWrapper";

export function AboutSection() {
  const { t } = useTranslation();

  return (
    <SectionWrapper id={SECTION_IDS.ABOUT} surfaceTone="deep">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <SectionHeader
            title={t("convention.about.title")}
            align="left"
            className="max-w-xl"
          />
        </div>
        <div className="mt-10 rounded-3xl border border-white/10 bg-surface/30 p-6 shadow-lg md:p-8">
          <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
            <p>{t("convention.about.paragraph1")}</p>
            <p>{t("convention.about.paragraph2")}</p>
          </div>
          <div className="mt-6 h-px w-16 bg-accent/50" />
          <p className="mt-6 font-display text-xl font-medium text-accent italic">
            {t("convention.about.highlight")}
          </p>
        </div>
      </div>
    </SectionWrapper>
  );
}
