import {
  Coffee,
  Mountain,
  PartyPopper,
  Sparkles,
  TreePalm,
  Waves,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

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
