import { useTranslation } from "react-i18next";
import { OrganizerCard } from "@/components/OrganizerCard";
import { SectionHeader } from "@/components/SectionHeader";
import { SectionWrapper } from "@/components/SectionWrapper";
import { ORGANIZERS, SECTION_IDS } from "@/content";

/** Organizers — the Furry Colombia team behind Sunfest, as photo cards. */
export function OrganizersSection() {
  const { t } = useTranslation();

  return (
    <SectionWrapper id={SECTION_IDS.organizers} surfaceTone="elevated">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionHeader
          title={t("organizers.title")}
          eyebrow={t("groups.community")}
          align="left"
        />
        <p className="max-w-md text-sm text-muted-foreground sm:text-base">
          {t("organizers.subtitle")}
        </p>
      </div>
      <div className="-mx-4 mt-12 flex flex-wrap justify-center">
        {ORGANIZERS.map((person) => (
          <div
            key={person.id}
            className="flex w-full flex-col px-4 pb-8 sm:w-1/2 xl:w-1/3"
          >
            <OrganizerCard
              id={person.id}
              image={person.image}
              initials={person.initials}
              name={t(`organizers.people.${person.id}.name`)}
              role={t(`organizers.people.${person.id}.role`)}
              bio={t(`organizers.people.${person.id}.bio`)}
            />
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
