import { useTranslation } from "react-i18next";

import { SECTION_IDS } from "@/features/convention/domain/constants";
import { FAQ_ITEMS } from "@/features/convention/application/data/faqItems";
import { FaqAccordionItem } from "../components/FaqAccordionItem";
import { SectionHeader } from "../components/SectionHeader";
import { SectionWrapper } from "../components/SectionWrapper";

export function FaqSection() {
  const { t } = useTranslation();

  return (
    <SectionWrapper id={SECTION_IDS.FAQ} surfaceTone="deep">
      <div className="mx-auto max-w-4xl">
        <SectionHeader title={t("convention.faq.title")} align="left" />
        <div className="mt-12">
          {FAQ_ITEMS.map((item) => (
            <FaqAccordionItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
