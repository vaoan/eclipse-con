import { useTranslation } from "react-i18next";
import { FaqItem } from "@/components/FaqItem";
import { SectionHeader } from "@/components/SectionHeader";
import { SectionWrapper } from "@/components/SectionWrapper";
import { FAQS, SECTION_IDS } from "@/content";

/** Frequently asked questions — a native disclosure accordion. */
export function FaqSection() {
  const { t } = useTranslation();

  return (
    <SectionWrapper id={SECTION_IDS.faq} surfaceTone="deep">
      <div className="mx-auto max-w-4xl">
        <SectionHeader
          title={t("faq.title")}
          eyebrow={t("groups.community")}
          align="left"
        />
        <div className="mt-12">
          {FAQS.map((id) => (
            <FaqItem
              key={id}
              id={id}
              question={t(`faq.items.${id}.question`)}
              answer={t(`faq.items.${id}.answer`)}
            />
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
