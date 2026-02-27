import { useTranslation } from "react-i18next";

import { SECTION_IDS } from "@/features/convention/domain/constants";
import { SectionHeader } from "../components/SectionHeader";
import { SectionWrapper } from "../components/SectionWrapper";

export function TravelSection() {
  const { t } = useTranslation();
  const tipKeys = [
    "weather",
    "rain",
    "thermals",
    "lago",
    "pantano",
    "salitre",
    "food",
    "events",
  ] as const;

  return (
    <SectionWrapper id={SECTION_IDS.TRAVEL} surfaceTone="deep">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionHeader
          title={t("convention.travel.title")}
          align="left"
          accent="red"
        />
        <p className="max-w-md text-sm text-muted-foreground sm:text-base">
          {t("convention.travel.subtitle")}
        </p>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {tipKeys.map((key) => (
          <div
            key={key}
            className="rounded-2xl border border-white/10 bg-surface/70 p-5"
          >
            <p className="text-sm font-semibold text-foreground">
              {t(`convention.travel.items.${key}.title`)}
            </p>
            <p className="mt-2 text-sm text-foreground/70">
              {t(`convention.travel.items.${key}.description`)}
            </p>
            <a
              href={t(`convention.travel.items.${key}.sourceUrl`)}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex text-xs uppercase tracking-[0.18em] text-muted-foreground underline decoration-dashed underline-offset-4 transition hover:text-foreground"
              data-content-section="travel"
              data-content-id={key}
            >
              {t(`convention.travel.items.${key}.sourceLabel`)}
            </a>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
