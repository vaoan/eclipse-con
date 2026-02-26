import { useTranslation } from "react-i18next";

import { SECTION_IDS } from "@/features/convention/domain/constants";
import { SectionHeader } from "../components/SectionHeader";
import { SectionWrapper } from "../components/SectionWrapper";

export function EventOverviewSection() {
  const { t } = useTranslation();

  return (
    <SectionWrapper id={SECTION_IDS.EVENT_OVERVIEW} surfaceTone="deep">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionHeader
          title={t("convention.eventOverview.title")}
          align="left"
        />
        <p className="max-w-md text-sm text-muted-foreground sm:text-base">
          {t("convention.eventOverview.subtitle")}
        </p>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {[
          t("convention.eventOverview.highlight1"),
          t("convention.eventOverview.highlight2"),
          t("convention.eventOverview.highlight3"),
        ].map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-white/10 bg-surface/70 p-5 text-sm text-foreground/80 shadow-sm"
          >
            {item}
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
