import { SECTION_IDS } from "@/features/convention/domain/constants";

export const NAV_GROUPS = [
  {
    key: "convention.nav.about",
    items: [{ id: SECTION_IDS.ABOUT, key: "convention.nav.about" }],
  },
  {
    key: "convention.nav.event",
    anchorId: SECTION_IDS.EVENTS,
    items: [
      { id: SECTION_IDS.EVENTS, key: "convention.nav.eventActivities" },
      { id: SECTION_IDS.REGISTRATION, key: "convention.nav.placePricing" },
    ],
  },
  {
    key: "convention.nav.place",
    anchorId: SECTION_IDS.VENUE,
    items: [
      { id: SECTION_IDS.VENUE, key: "convention.nav.placeHotel" },
      { id: SECTION_IDS.AMENITIES, key: "convention.nav.placeFind" },
      { id: SECTION_IDS.TRAVEL, key: "convention.nav.placeTravel" },
    ],
  },
  {
    key: "convention.nav.news",
    items: [{ id: SECTION_IDS.NEWS, key: "convention.nav.news" }],
  },
  {
    key: "convention.nav.guests",
    items: [{ id: SECTION_IDS.GUESTS, key: "convention.nav.guests" }],
  },
  {
    key: "convention.nav.faq",
    items: [{ id: SECTION_IDS.FAQ, key: "convention.nav.faq" }],
  },
] as const;
