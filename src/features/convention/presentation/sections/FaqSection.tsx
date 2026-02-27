import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { CircleAlert } from "lucide-react";

import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
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
        <SectionHeader
          title={t("convention.faq.title")}
          align="left"
          accent="gold"
        />
        <Accordion type="single" collapsible className="mt-12">
          {FAQ_ITEMS.map((item) => (
            <FaqAccordionItem key={item.id} item={item} />
          ))}
        </Accordion>
        <div className="mt-8 rounded-2xl border border-accent/45 bg-accent/10 p-5 shadow-[0_18px_40px_-32px_hsl(var(--accent))]">
          <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-accent">
            <CircleAlert className="h-4 w-4" />
            {t("convention.faq.tutorialCallout.badge")}
          </div>
          <p className="mt-3 max-w-2xl text-sm text-foreground/90 sm:text-base">
            {t("convention.faq.tutorialCallout.description")}
          </p>
          <Button
            asChild
            className="mt-4 bg-accent text-accent-foreground hover:bg-accent-glow"
          >
            <Link
              to="/registration-tutorial"
              data-funnel-step="faq_tutorial_open"
              data-cta-id="faq_registration_tutorial_open"
              data-cta-variant="faq_highlight"
              data-content-section="faq"
              data-content-id="faq_tutorial_callout"
              data-content-interaction="open"
            >
              {t("convention.faq.tutorialCallout.cta")}
            </Link>
          </Button>
        </div>
      </div>
    </SectionWrapper>
  );
}
