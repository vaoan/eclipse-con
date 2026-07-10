import {
  Coffee,
  Mountain,
  PartyPopper,
  Sparkles,
  TreePalm,
  Waves,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import fonda from "@/assets/venue/fonda.webp";
import grounds from "@/assets/venue/grounds.webp";
import landscape from "@/assets/venue/landscape.webp";
import pool from "@/assets/venue/pool.webp";
import poolNature from "@/assets/venue/pool-nature.webp";
import valley from "@/assets/venue/valley.webp";

/** One Hotel Mocawa photo shown as a carnaval flag, with i18n keys for its text. */
export interface VenuePhoto {
  readonly src: string;
  readonly altKey: string;
  readonly captionKey: string;
}

/** The curated venue photos, in display order, strung across the gallery. */
export const VENUE_PHOTOS: readonly VenuePhoto[] = [
  {
    src: pool,
    altKey: "venue.photos.pool.alt",
    captionKey: "venue.photos.pool.caption",
  },
  {
    src: valley,
    altKey: "venue.photos.valley.alt",
    captionKey: "venue.photos.valley.caption",
  },
  {
    src: fonda,
    altKey: "venue.photos.fonda.alt",
    captionKey: "venue.photos.fonda.caption",
  },
  {
    src: grounds,
    altKey: "venue.photos.grounds.alt",
    captionKey: "venue.photos.grounds.caption",
  },
  {
    src: landscape,
    altKey: "venue.photos.landscape.alt",
    captionKey: "venue.photos.landscape.caption",
  },
  {
    src: poolNature,
    altKey: "venue.photos.poolNature.alt",
    captionKey: "venue.photos.poolNature.caption",
  },
];

/** A single "what you'll find" highlight: a lucide icon, a label key and a palette accent. */
export interface HighlightCard {
  readonly icon: LucideIcon;
  readonly labelKey: string;
  readonly color: string;
}

/** The six highlight cards; colors cycle the four official carnaval hues. */
export const HIGHLIGHTS: readonly HighlightCard[] = [
  { icon: Waves, labelKey: "highlights.pools", color: "var(--color-teal)" },
  { icon: Sparkles, labelKey: "highlights.spa", color: "var(--color-yellow)" },
  {
    icon: Coffee,
    labelKey: "highlights.coffee",
    color: "var(--color-magenta)",
  },
  {
    icon: TreePalm,
    labelKey: "highlights.nature",
    color: "var(--color-purple-soft)",
  },
  {
    icon: Mountain,
    labelKey: "highlights.mountains",
    color: "var(--color-teal)",
  },
  {
    icon: PartyPopper,
    labelKey: "highlights.carnaval",
    color: "var(--color-yellow)",
  },
];
