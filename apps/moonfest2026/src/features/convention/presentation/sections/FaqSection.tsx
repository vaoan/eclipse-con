import { useTranslation } from "react-i18next";
import { CircleAlert } from "lucide-react";
import { Link } from "react-router-dom";

import { Accordion } from "@/shared/presentation/ui/accordion";
import { SECTION_IDS } from "@/features/convention/domain/constants";
import { FAQ_ITEMS } from "@/features/convention/application/data/faqItems";
import { tid } from "@/shared/application/utils/tid";
import { FaqAccordionItem } from "../components/FaqAccordionItem";
import { SectionHeader } from "../components/SectionHeader";
import { SectionWrapper } from "../components/SectionWrapper";

/** Renders the FAQ section with a collapsible accordion of questions and a tutorial callout. */
export function FaqSection() {
  const { t } = useTranslation();

  return (
    <SectionWrapper
      id={SECTION_IDS.FAQ}
      surfaceTone="deep"
      decorations={
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "url('/Patron_nuevo.webp')",
            backgroundSize: "600px",
            backgroundRepeat: "repeat",
          }}
          aria-hidden="true"
        />
      }
    >
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
          <Link
            to="/registration-tutorial"
            className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-[0_0_16px_rgba(224,117,58,0.2)] transition-colors hover:bg-accent-glow"
            data-funnel-step="faq_tutorial_open"
            data-cta-id="faq_registration_tutorial_interest"
            data-cta-variant="primary"
            data-content-section="faq"
            data-content-id="faq_tutorial_callout"
            data-content-interaction="open"
            {...tid("faq-registration-tutorial-link")}
          >
            {t("convention.faq.tutorialCallout.cta")}
          </Link>
        </div>
      </div>
    </SectionWrapper>
  );
}
