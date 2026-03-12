import type { Guest } from "@/features/convention/domain/types";

/** Static list of featured guests displayed in the Guests section. */
export const GUESTS: readonly Guest[] = [
  {
    id: "guest1",
    nameKey: "convention.guests.guest1.name",
    roleKey: "convention.guests.guest1.role",
    bioKey: "convention.guests.guest1.bio",
    initials: "JH",
    imageSrc: "/assets/organizers/difverrakudif.png",
  },
  {
    id: "guest5",
    nameKey: "convention.guests.guest5.name",
    roleKey: "convention.guests.guest5.role",
    bioKey: "convention.guests.guest5.bio",
    initials: "NA",
    imageSrc: "/assets/organizers/nacho.webp",
  },
  {
    id: "guest6",
    nameKey: "convention.guests.guest6.name",
    roleKey: "convention.guests.guest6.role",
    bioKey: "convention.guests.guest6.bio",
    initials: "RA",
    imageSrc: "/assets/organizers/ranita.jpg",
  },
];
