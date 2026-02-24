import { useTranslation } from "react-i18next";

import { SECTION_IDS } from "@/features/convention/domain/constants";
import { FAQ_ITEMS } from "@/features/convention/application/data/faqItems";
import { FaqAccordionItem } from "../components/FaqAccordionItem";
import { SectionWrapper } from "../components/SectionWrapper";

export function FaqSection() {
  const { t } = useTranslation();

  return (
    <SectionWrapper id={SECTION_IDS.FAQ} surfaceTone="deep">
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
