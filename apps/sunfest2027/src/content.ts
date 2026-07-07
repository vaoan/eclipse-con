/**
 * Static content model for the Sunfest site. Each entry pairs a stable id
 * (used to build i18n keys) with presentational metadata like an icon.
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

/** Activities shown in "what you'll find". Copy from `activities.<id>.*`. */
export const ACTIVITIES = [
  { id: "carnaval", icon: "🎭" },
  { id: "dances", icon: "🎶" },
  { id: "panels", icon: "🎤" },
  { id: "dealers", icon: "🛍️" },
  { id: "coffee", icon: "☕" },
  { id: "pools", icon: "💧" },
  { id: "community", icon: "🤝" },
  { id: "breakfast", icon: "🥐" },
] as const;

/** Hotel Mocawa amenities. Labels from `amenities.items.<id>`. */
export const AMENITIES = [
  { id: "adultPool", icon: "🏊" },
  { id: "kidsPool", icon: "🧒" },
  { id: "spa", icon: "💆" },
  { id: "gym", icon: "🏋️" },
  { id: "tennis", icon: "🎾" },
  { id: "puttingGreen", icon: "⛳" },
  { id: "restaurant", icon: "🍽️" },
  { id: "bars", icon: "🍹" },
  { id: "fonda", icon: "🫓" },
  { id: "gameRooms", icon: "🎮" },
  { id: "businessCenter", icon: "💼" },
  { id: "wifi", icon: "📶" },
  { id: "parking", icon: "🅿️" },
  { id: "transfers", icon: "🚐" },
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

/** Travel tips. Copy from `travel.items.<id>.*`. */
export const TRAVEL_TIPS = [
  { id: "airport", icon: "✈️" },
  { id: "transfers", icon: "🚐" },
  { id: "weather", icon: "☀️" },
  { id: "coffee", icon: "🌄" },
  { id: "food", icon: "🍽️" },
  { id: "cocora", icon: "🌴" },
] as const;

/** Furry Colombia organizers. Copy from `organizers.people.<id>.*`. */
export const ORGANIZERS = [
  { id: "gau", initials: "JH" },
  { id: "nacho", initials: "NA" },
  { id: "lucia", initials: "LU" },
  { id: "nell", initials: "NE" },
  { id: "vaoan", initials: "VA" },
  { id: "nax", initials: "NX" },
] as const;

/** FAQ entries. Copy from `faq.items.<id>.*`. */
export const FAQS = [
  "packages",
  "included",
  "booking",
  "dates",
  "lodging",
  "changes",
  "questions",
] as const;
