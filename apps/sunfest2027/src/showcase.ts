import aerial from "@/assets/showcase/aerial.webp";
import common from "@/assets/showcase/common.webp";
import giantPool from "@/assets/showcase/giant-pool.webp";
import landscape from "@/assets/showcase/landscape.webp";
import poolside from "@/assets/showcase/poolside.webp";
import restaurant from "@/assets/showcase/restaurant.webp";
import roomKing from "@/assets/showcase/room-king.webp";
import roomSuite from "@/assets/showcase/room-suite.webp";
import roomTwin from "@/assets/showcase/room-twin.webp";
import spa from "@/assets/showcase/spa.webp";

/**
 * One Hotel Mocawa photo in the resort showcase. `titleKey`/`blurbKey` feed
 * both the card caption and the lightbox footer; `altKey` is its image alt.
 */
export interface ShowcaseItem {
  readonly id: string;
  readonly src: string;
  readonly altKey: string;
  readonly titleKey: string;
  readonly blurbKey: string;
}

/** Build a showcase item from its id, wiring the standard `showcase.items.<id>.*` keys. */
function item(id: string, source: string): ShowcaseItem {
  return {
    id,
    src: source,
    altKey: `showcase.items.${id}.alt`,
    titleKey: `showcase.items.${id}.title`,
    blurbKey: `showcase.items.${id}.blurb`,
  };
}

/** The giant pool — the section's wide feature image. */
export const SHOWCASE_FEATURE: ShowcaseItem = item("giantPool", giantPool);

/** The three room types, shown as tall portrait cards. */
export const SHOWCASE_ROOMS: readonly ShowcaseItem[] = [
  item("suite", roomSuite),
  item("king", roomKing),
  item("twin", roomTwin),
];

/** Pool, spa, dining, grounds and landscape — the wide amenity cards. */
export const SHOWCASE_GROUNDS: readonly ShowcaseItem[] = [
  item("poolside", poolside),
  item("aerial", aerial),
  item("spa", spa),
  item("restaurant", restaurant),
  item("common", common),
  item("landscape", landscape),
];

/**
 * Every showcase item in display/lightbox order (feature → rooms → grounds).
 * The lightbox cycles this flat list; each section maps its own slice.
 */
export const SHOWCASE_ITEMS: readonly ShowcaseItem[] = [
  SHOWCASE_FEATURE,
  ...SHOWCASE_ROOMS,
  ...SHOWCASE_GROUNDS,
];
