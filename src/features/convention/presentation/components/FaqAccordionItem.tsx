import { useTranslation } from "react-i18next";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { tid } from "@/shared/application/utils/tid";
import type { FaqItem } from "@/features/convention/domain/types";

interface FaqAccordionItemProps {
  readonly item: FaqItem;
}

/** Renders a collapsible accordion item for a single FAQ question and answer. */
export function FaqAccordionItem({ item }: Readonly<FaqAccordionItemProps>) {
  const { t } = useTranslation();

  return (
    <AccordionItem
      value={item.id}
      className="border-b border-white/5"
      {...tid(`faq-item-${item.id}`)}
    >
      <AccordionTrigger
        className="py-5 text-left text-base font-semibold text-foreground"
        data-faq-id={item.id}
        data-faq-theme={item.theme}
        data-content-section="faq"
        data-content-id={item.id}
        data-content-interaction="expand"
      >
        {t(item.questionKey)}
      </AccordionTrigger>
      <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
        {t(item.answerKey)}
      </AccordionContent>
    </AccordionItem>
  );
}
