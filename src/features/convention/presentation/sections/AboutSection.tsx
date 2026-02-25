import { useTranslation } from "react-i18next";

import { SECTION_IDS } from "@/features/convention/domain/constants";
import { SectionHeader } from "../components/SectionHeader";
import { SectionWrapper } from "../components/SectionWrapper";

export function AboutSection() {
  const { t } = useTranslation();

  return (
    <SectionWrapper id={SECTION_IDS.ABOUT} surfaceTone="deep">
      <div className="mx-auto max-w-3xl text-center">
        <SectionHeader title={t("convention.about.title")} />
        <p className="mt-8 text-lg leading-relaxed text-muted-foreground">
          {t("convention.about.paragraph1")}
        </p>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          {t("convention.about.paragraph2")}
        </p>
      </div>
    </SectionWrapper>
  );
}
