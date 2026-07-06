/** Translation keys for hotel package features shown in the Step 1 card. */
export const PACKAGE_FEATURE_KEYS = [
  "convention.registration.package.feature1",
  "convention.registration.package.feature5",
] as const;

/** Translation keys for ticket features shown in the Step 2 card. */
export const TICKET_FEATURE_KEYS = [
  "convention.registration.step2.feature1",
  "convention.registration.step2.feature2",
  "convention.registration.step2.feature3",
] as const;

/** Hotel room price tiers ordered from most to least affordable. */
export const PRICE_TIERS = [
  {
    nameKey: "convention.registration.quad.name",
    priceKey: "convention.registration.quad.price",
  },
  {
    nameKey: "convention.registration.trio.name",
    priceKey: "convention.registration.trio.price",
  },
  {
    nameKey: "convention.registration.duo.name",
    priceKey: "convention.registration.duo.price",
  },
  {
    nameKey: "convention.registration.solo.name",
    priceKey: "convention.registration.solo.price",
  },
] as const;
