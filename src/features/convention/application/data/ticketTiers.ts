import type { TicketTier } from "@/features/convention/domain/types";

export const TICKET_TIERS: readonly TicketTier[] = [
  {
    id: "quad",
    nameKey: "convention.registration.quad.name",
    priceKey: "convention.registration.quad.price",
    featuresKeys: [
      "convention.registration.package.feature1",
      "convention.registration.package.feature2",
      "convention.registration.package.feature5",
      "convention.registration.package.feature3",
      "convention.registration.package.feature4",
    ],
    highlighted: true,
  },
  {
    id: "trio",
    nameKey: "convention.registration.trio.name",
    priceKey: "convention.registration.trio.price",
    featuresKeys: [
      "convention.registration.package.feature1",
      "convention.registration.package.feature2",
      "convention.registration.package.feature5",
      "convention.registration.package.feature3",
      "convention.registration.package.feature4",
    ],
    highlighted: false,
  },
  {
    id: "soloDuo",
    nameKey: "convention.registration.soloDuo.name",
    priceKey: "convention.registration.soloDuo.price",
    featuresKeys: [
      "convention.registration.package.feature1",
      "convention.registration.package.feature2",
      "convention.registration.package.feature5",
      "convention.registration.package.feature4SoloDuo",
    ],
    highlighted: false,
  },
];
