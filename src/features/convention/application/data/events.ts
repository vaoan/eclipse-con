import type { ConventionEvent } from "@/features/convention/domain/types";

export const EVENTS: readonly ConventionEvent[] = [
  {
    id: "community",
    titleKey: "convention.events.community.title",
    descriptionKey: "convention.events.community.description",
    icon: "MessageSquare",
  },
  {
    id: "games",
    titleKey: "convention.events.games.title",
    descriptionKey: "convention.events.games.description",
    icon: "Star",
  },
  {
    id: "hotSprings",
    titleKey: "convention.events.hotSprings.title",
    descriptionKey: "convention.events.hotSprings.description",
    icon: "Palette",
  },
  {
    id: "nature",
    titleKey: "convention.events.nature.title",
    descriptionKey: "convention.events.nature.description",
    icon: "Paintbrush",
  },
  {
    id: "panels",
    titleKey: "convention.events.panels.title",
    descriptionKey: "convention.events.panels.description",
    icon: "Star",
  },
  {
    id: "dealers",
    titleKey: "convention.events.dealers.title",
    descriptionKey: "convention.events.dealers.description",
    icon: "ShoppingBag",
  },
  {
    id: "mainEvent",
    titleKey: "convention.events.mainEvent.title",
    descriptionKey: "convention.events.mainEvent.description",
    icon: "Music",
  },
];
