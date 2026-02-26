import type { Guest } from "@/features/convention/domain/types";

export const GUESTS: readonly Guest[] = [
  {
    id: "guest1",
    nameKey: "convention.guests.guest1.name",
    roleKey: "convention.guests.guest1.role",
    bioKey: "convention.guests.guest1.bio",
    initials: "BO",
    imageSrc: "/assets/organizers/organizer-ballroom.png",
  },
  {
    id: "guest2",
    nameKey: "convention.guests.guest2.name",
    roleKey: "convention.guests.guest2.role",
    bioKey: "convention.guests.guest2.bio",
    initials: "AC",
    imageSrc: "/assets/organizers/organizer-club.svg",
  },
  {
    id: "guest3",
    nameKey: "convention.guests.guest3.name",
    roleKey: "convention.guests.guest3.role",
    bioKey: "convention.guests.guest3.bio",
    initials: "MS",
    imageSrc: "/assets/organizers/organizer-swing.svg",
  },
  {
    id: "guest4",
    nameKey: "convention.guests.guest4.name",
    roleKey: "convention.guests.guest4.role",
    bioKey: "convention.guests.guest4.bio",
    initials: "LN",
    imageSrc: "/assets/organizers/organizer-minimal.png",
  },
];
