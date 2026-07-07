import { useTranslation } from "react-i18next";
import { SectionHeader } from "@/components/SectionHeader";
import { FAQS, SECTION_IDS } from "@/content";

/** Frequently asked questions — native disclosure accordion. */
export function FaqSection() {
  const { t } = useTranslation();
  return (
    <section id={SECTION_IDS.faq} className="section">
      <div className="container container-narrow">
        <SectionHeader title={t("faq.title")} />
        <div className="faq-list">
          {FAQS.map((id) => (
            <details key={id} className="faq-item">
              <summary
                className="faq-q"
                data-content-section="faq"
                data-content-id={`faq_${id}`}
                data-content-interaction="expand"
              >
                {t(`faq.items.${id}.question`)}
              </summary>
              <p className="faq-a">{t(`faq.items.${id}.answer`)}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
