import { useTranslation } from "react-i18next";
import { OrganizerCard } from "@/components/OrganizerCard";
import { SectionHeader } from "@/components/SectionHeader";
import { ORGANIZERS, SECTION_IDS } from "@/content";

/** Organizers — the Furry Colombia team behind Sunfest. */
export function OrganizersSection() {
  const { t } = useTranslation();
  return (
    <section id={SECTION_IDS.organizers} className="section section-alt">
      <div className="container">
        <SectionHeader
          title={t("organizers.title")}
          subtitle={t("organizers.subtitle")}
        />
        <div className="card-grid">
          {ORGANIZERS.map((person) => (
            <OrganizerCard
              key={person.id}
              initials={person.initials}
              name={t(`organizers.people.${person.id}.name`)}
              role={t(`organizers.people.${person.id}.role`)}
              bio={t(`organizers.people.${person.id}.bio`)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
