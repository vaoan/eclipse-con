import { useTranslation } from "react-i18next";

import { SECTION_IDS } from "@/features/convention/domain/constants";
import { SectionHeader } from "../components/SectionHeader";
import { SectionWrapper } from "../components/SectionWrapper";

export function AttendeesSection() {
  const { t } = useTranslation();

  return (
    <SectionWrapper id={SECTION_IDS.ATTENDEES} surfaceTone="elevated">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionHeader title={t("convention.attendees.title")} align="left" />
        <p className="max-w-md text-sm text-muted-foreground sm:text-base">
          {t("convention.attendees.subtitle")}
        </p>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {[
          t("convention.attendees.group1"),
          t("convention.attendees.group2"),
          t("convention.attendees.group3"),
        ].map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-white/10 bg-surface/80 p-5 text-sm text-foreground/80"
          >
            {item}
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
