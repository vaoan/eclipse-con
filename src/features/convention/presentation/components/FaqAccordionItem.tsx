import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";

import { cn } from "@/shared/application/utils/cn";
import { tid } from "@/shared/application/utils/tid";
import type { FaqItem } from "@/features/convention/domain/types";

interface FaqAccordionItemProps {
  readonly item: FaqItem;
}

export function FaqAccordionItem({ item }: Readonly<FaqAccordionItemProps>) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-white/5" {...tid(`faq-item-${item.id}`)}>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        className="flex w-full items-center justify-between py-5 text-left"
        aria-expanded={isOpen}
      >
        <span className="font-display pr-4 text-lg font-medium text-foreground">
          {t(item.questionKey)}
        </span>
        <ChevronDown
          size={20}
          className={cn(
            "shrink-0 text-accent transition-transform duration-300",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-300",
          isOpen ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t(item.answerKey)}
          </p>
        </div>
      </div>
    </div>
  );
}
