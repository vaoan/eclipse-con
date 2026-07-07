import { useTranslation } from "react-i18next";
import { SectionHeader } from "@/components/SectionHeader";
import { SectionWrapper } from "@/components/SectionWrapper";
import { SECTION_IDS } from "@/content";

/** "Why Sunfest?" — intro paragraphs paired with a Quindío landscape photo. */
export function AboutSection() {
  const { t } = useTranslation();
  const title = t("about.title");

  return (
    <SectionWrapper id={SECTION_IDS.about} surfaceTone="deep">
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.82fr]">
        <div>
          <SectionHeader
            title={title}
            eyebrow={t("groups.event")}
            align="left"
          />
          <p className="mt-8 text-lg leading-relaxed text-muted-foreground">
            {t("about.paragraph1")}
          </p>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            {t("about.paragraph2")}
          </p>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            {t("about.paragraph3")}
          </p>
        </div>
        <div className="relative">
          <div
            className="absolute -inset-4 rounded-3xl bg-[radial-gradient(circle_at_top,_rgba(200,54,140,0.2),_transparent_60%)] blur-2xl"
            aria-hidden="true"
          />
          <img
            src="/assets/hotel/quindio.webp"
            alt={title}
            width={900}
            height={600}
            className="relative w-full rounded-3xl border border-white/10 object-cover shadow-xl"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </SectionWrapper>
  );
}
