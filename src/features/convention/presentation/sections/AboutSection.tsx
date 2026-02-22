import { useTranslation } from "react-i18next";

import { SECTION_IDS } from "@/features/convention/domain/constants";
import { SectionWrapper } from "../components/SectionWrapper";

export function AboutSection() {
  const { t } = useTranslation();

  return (
    <SectionWrapper id={SECTION_IDS.ABOUT} className="bg-surface">
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
