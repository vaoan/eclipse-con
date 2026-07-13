import {
  Coffee,
  Mountain,
  PartyPopper,
  Sparkles,
  TreePalm,
  Waves,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import common from "@/assets/showcase/common.webp";
import fonda from "@/assets/showcase/fonda.webp";
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

/** The giant pool — the showcase's wide feature image. */
export const SHOWCASE_FEATURE: ShowcaseItem = item("giantPool", giantPool);

/** The three room types, shown as tall portrait cards. */
export const SHOWCASE_ROOMS: readonly ShowcaseItem[] = [
  item("suite", roomSuite),
  item("king", roomKing),
  item("twin", roomTwin),
];

/** The showcase lightbox order: the giant pool, then the rooms. */
export const SHOWCASE_ITEMS: readonly ShowcaseItem[] = [
  SHOWCASE_FEATURE,
  ...SHOWCASE_ROOMS,
];

/** A venue amenity: a showcase photo plus a lucide icon and a palette accent. */
export interface Amenity extends ShowcaseItem {
  readonly icon: LucideIcon;
  readonly color: string;
}

/** Build an amenity from its id, photo, icon and accent color. */
function amenity(
  id: string,
  source: string,
  icon: LucideIcon,
  color: string
): Amenity {
  return { ...item(id, source), icon, color };
}

/**
 * The venue amenities, each shown as a photo + icon + label + blurb card and
 * cycled through their own lightbox. Colors rotate the carnaval hues.
 */
export const AMENITIES: readonly Amenity[] = [
  amenity("poolside", poolside, Waves, "var(--color-teal)"),
  amenity("spa", spa, Sparkles, "var(--color-yellow)"),
  amenity("restaurant", restaurant, Coffee, "var(--color-magenta)"),
  amenity("fonda", fonda, PartyPopper, "var(--color-purple-soft)"),
  amenity("common", common, TreePalm, "var(--color-teal)"),
  amenity("landscape", landscape, Mountain, "var(--color-yellow)"),
];
