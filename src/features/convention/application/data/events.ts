import type { ConventionEvent } from "@/features/convention/domain/types";

export const EVENTS: readonly ConventionEvent[] = [
  {
    id: "panels",
    titleKey: "convention.events.panels.title",
    descriptionKey: "convention.events.panels.description",
    icon: "MessageSquare",
  },
  {
    id: "workshops",
    titleKey: "convention.events.workshops.title",
    descriptionKey: "convention.events.workshops.description",
    icon: "Paintbrush",
  },
  {
    id: "matsuri",
    titleKey: "convention.events.matsuri.title",
    descriptionKey: "convention.events.matsuri.description",
    icon: "Music",
  },
  {
    id: "art",
    titleKey: "convention.events.art.title",
    descriptionKey: "convention.events.art.description",
    icon: "Palette",
  },
  {
    id: "cosplay",
    titleKey: "convention.events.cosplay.title",
    descriptionKey: "convention.events.cosplay.description",
    icon: "Star",
  },
  {
    id: "dealers",
    titleKey: "convention.events.dealers.title",
    descriptionKey: "convention.events.dealers.description",
    icon: "ShoppingBag",
  },
];
