import { useTranslation } from "react-i18next";

import { SECTION_IDS } from "@/features/convention/domain/constants";
import { SectionHeader } from "../components/SectionHeader";
import { GuestCard } from "../components/GuestCard";
import { SectionWrapper } from "../components/SectionWrapper";

export function AttendeesSection() {
  const { t } = useTranslation();
  const guests = [
    {
      id: "special-1",
      nameKey: "convention.attendees.guest1.name",
      roleKey: "convention.attendees.guest1.role",
      bioKey: "convention.attendees.guest1.bio",
      imageSrc: "/assets/guests/guest-05.png",
      initials: "NE",
    },
    {
      id: "special-2",
      nameKey: "convention.attendees.guest2.name",
      roleKey: "convention.attendees.guest2.role",
      bioKey: "convention.attendees.guest2.bio",
      imageSrc: "/assets/guests/guest-06.png",
      initials: "RV",
    },
    {
      id: "special-3",
      nameKey: "convention.attendees.guest3.name",
      roleKey: "convention.attendees.guest3.role",
      bioKey: "convention.attendees.guest3.bio",
      imageSrc: "/assets/guests/guest-07.png",
      initials: "LA",
    },
    {
      id: "special-4",
      nameKey: "convention.attendees.guest4.name",
      roleKey: "convention.attendees.guest4.role",
      bioKey: "convention.attendees.guest4.bio",
      imageSrc: "/assets/guests/guest-08.png",
      initials: "KE",
    },
    {
      id: "special-5",
      nameKey: "convention.attendees.guest5.name",
      roleKey: "convention.attendees.guest5.role",
      bioKey: "convention.attendees.guest5.bio",
      imageSrc: "/assets/guests/guest-09.png",
      initials: "MS",
    },
  ] as const;

  return (
    <SectionWrapper id={SECTION_IDS.ATTENDEES} surfaceTone="elevated">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionHeader
          title={t("convention.attendees.title")}
          align="left"
          accent="green"
        />
        <p className="max-w-md text-sm text-muted-foreground sm:text-base">
          {t("convention.attendees.subtitle")}
        </p>
      </div>
      <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {guests.map((guest) => (
          <GuestCard key={guest.id} guest={guest} />
        ))}
      </div>
    </SectionWrapper>
  );
}
