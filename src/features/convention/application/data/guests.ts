import type { Guest } from "@/features/convention/domain/types";

export const GUESTS: readonly Guest[] = [
  {
    id: "guest1",
    nameKey: "convention.guests.guest1.name",
    roleKey: "convention.guests.guest1.role",
    bioKey: "convention.guests.guest1.bio",
    initials: "HM",
  },
  {
    id: "guest2",
    nameKey: "convention.guests.guest2.name",
    roleKey: "convention.guests.guest2.role",
    bioKey: "convention.guests.guest2.bio",
    initials: "SK",
  },
  {
    id: "guest3",
    nameKey: "convention.guests.guest3.name",
    roleKey: "convention.guests.guest3.role",
    bioKey: "convention.guests.guest3.bio",
    initials: "RT",
  },
];
