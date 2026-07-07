/**
 * Static content model for the Sunfest site. Ids build i18n keys; a few
 * entries carry presentational metadata (organizer initials, section group).
 */

/** Section ids used for nav anchors and scroll targeting. */
export const SECTION_IDS = {
  hero: "hero",
  about: "about",
  activities: "activities",
  venue: "venue",
  amenities: "amenities",
  travel: "travel",
  organizers: "organizers",
  faq: "faq",
} as const;

/** Nav links, in scroll order. Labels come from `nav.<id>`. */
export const NAV_LINKS = [
  "about",
  "activities",
  "venue",
  "travel",
  "organizers",
  "faq",
] as const;

/** Activity ids. Copy from `activities.<id>.*`. */
export const ACTIVITIES = [
  "carnaval",
  "dances",
  "panels",
  "dealers",
  "coffee",
  "pools",
  "community",
  "breakfast",
] as const;

/** Hotel Mocawa amenity ids. Labels from `amenities.items.<id>`. */
export const AMENITIES = [
  "adultPool",
  "kidsPool",
  "spa",
  "gym",
  "tennis",
  "puttingGreen",
  "restaurant",
  "bars",
  "fonda",
  "gameRooms",
  "businessCenter",
  "wifi",
  "parking",
  "transfers",
] as const;

/** Venue feature bullets. Copy from `venue.features.<id>`. */
export const VENUE_FEATURES = [
  "location",
  "airport",
  "pools",
  "wellness",
  "dining",
  "landscape",
] as const;

/** Travel tip ids. Copy from `travel.<id>.*`. */
export const TRAVEL_TIPS = [
  "airport",
  "transfers",
  "weather",
  "coffee",
  "food",
  "cocora",
] as const;

/** Furry Colombia organizers with photo + initials. Copy from `organizers.people.<id>.*`. */
export const ORGANIZERS = [
  { id: "gau", initials: "JH", image: "/assets/organizers/difverrakudif.png" },
  { id: "nacho", initials: "NA", image: "/assets/organizers/nacho.webp" },
  { id: "lucia", initials: "LF", image: "/assets/organizers/luciafur.jpg" },
  { id: "nell", initials: "NL", image: "/assets/organizers/nell.webp" },
  { id: "vaoan", initials: "VA", image: "/assets/organizers/vaoan.jpg" },
  { id: "nax", initials: "NX", image: "/assets/organizers/nax.png" },
] as const;

/** FAQ entry ids. Copy from `faq.items.<id>.*`. */
export const FAQS = [
  "packages",
  "included",
  "booking",
  "dates",
  "lodging",
  "changes",
  "questions",
] as const;
