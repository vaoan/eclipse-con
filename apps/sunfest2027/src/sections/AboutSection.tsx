import { useTranslation } from "react-i18next";
import { SectionHeader } from "@/components/SectionHeader";
import { SECTION_IDS } from "@/content";

/** "Why Sunfest?" — three intro paragraphs about the event. */
export function AboutSection() {
  const { t } = useTranslation();
  return (
    <section id={SECTION_IDS.about} className="section">
      <div className="container">
        <SectionHeader title={t("about.title")} />
        <div className="prose">
          <p>{t("about.paragraph1")}</p>
          <p>{t("about.paragraph2")}</p>
          <p>{t("about.paragraph3")}</p>
        </div>
      </div>
    </section>
  );
}
