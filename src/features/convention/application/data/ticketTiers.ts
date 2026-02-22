import type { TicketTier } from "@/features/convention/domain/types";

export const TICKET_TIERS: readonly TicketTier[] = [
  {
    id: "standard",
    nameKey: "convention.registration.standard.name",
    priceKey: "convention.registration.standard.price",
    featuresKeys: [
      "convention.registration.standard.feature1",
      "convention.registration.standard.feature2",
      "convention.registration.standard.feature3",
      "convention.registration.standard.feature4",
    ],
    highlighted: false,
  },
  {
    id: "premium",
    nameKey: "convention.registration.premium.name",
    priceKey: "convention.registration.premium.price",
    featuresKeys: [
      "convention.registration.premium.feature1",
      "convention.registration.premium.feature2",
      "convention.registration.premium.feature3",
      "convention.registration.premium.feature4",
    ],
    highlighted: true,
  },
  {
    id: "patron",
    nameKey: "convention.registration.patron.name",
    priceKey: "convention.registration.patron.price",
    featuresKeys: [
      "convention.registration.patron.feature1",
      "convention.registration.patron.feature2",
      "convention.registration.patron.feature3",
      "convention.registration.patron.feature4",
    ],
    highlighted: false,
  },
];
