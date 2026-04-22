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
    id: "guest2",
    nameKey: "convention.guests.guest2.name",
    roleKey: "convention.guests.guest2.role",
    bioKey: "convention.guests.guest2.bio",
    initials: "NA",
    imageSrc: "/assets/organizers/nacho.webp",
  },
  {
    id: "guest3",
    nameKey: "convention.guests.guest3.name",
    roleKey: "convention.guests.guest3.role",
    bioKey: "convention.guests.guest3.bio",
    initials: "LF",
    imageSrc: "/assets/organizers/luciafur.jpg",
  },
  {
    id: "guest4",
    nameKey: "convention.guests.guest4.name",
    roleKey: "convention.guests.guest4.role",
    bioKey: "convention.guests.guest4.bio",
    initials: "NL",
    imageSrc: "/assets/organizers/nell.webp",
  },
  {
    id: "guest6",
    nameKey: "convention.guests.guest6.name",
    roleKey: "convention.guests.guest6.role",
    bioKey: "convention.guests.guest6.bio",
    initials: "NX",
    imageSrc: "/assets/organizers/nax.png",
  },
  {
    id: "guest5",
    nameKey: "convention.guests.guest5.name",
    roleKey: "convention.guests.guest5.role",
    bioKey: "convention.guests.guest5.bio",
    initials: "VA",
    imageSrc: "/assets/organizers/vaoan.jpg",
  },
];
