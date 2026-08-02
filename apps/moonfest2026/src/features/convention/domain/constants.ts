/** Display name for the convention. */
export const CONVENTION_NAME = "Moonfest 2026";

/** Stable HTML element IDs for each page section, used for navigation and scroll targeting. */
export const SECTION_IDS = {
  HERO: "hero",
  ABOUT: "about",
  PLACE_GROUP: "place",
  EVENT_OVERVIEW: "event-overview",
  EVENTS: "events",
  GUESTS: "guests",
  COMMUNITY_GROUP: "community",
  ATTENDEES: "attendees",
  VENUE: "venue",
  AMENITIES: "amenities",
  TRAVEL: "travel",
  EVENT_GROUP: "event",
  REGISTRATION: "registration",
  FAQ: "faq",
  NEWS: "news",
} as const;

/** Number of floating sakura petal particles rendered on-screen. */
export const SAKURA_PARTICLE_COUNT = 20;

/** Parallax scroll speed presets used to control layer depth. */
export const PARALLAX_SPEED = {
  SLOW: 0.15,
  MEDIUM: 0.3,
  FAST: 0.5,
} as const;
