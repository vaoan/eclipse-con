import { describe, expect, it } from "vitest";
import {
  AMENITIES,
  SHOWCASE_FEATURE,
  SHOWCASE_ITEMS,
  SHOWCASE_ROOMS,
} from "@/showcase";

describe("showcase data", () => {
  it("lists the giant pool feature then the rooms in lightbox order", () => {
    expect(SHOWCASE_ITEMS[0]).toBe(SHOWCASE_FEATURE);
    expect(SHOWCASE_ITEMS).toHaveLength(1 + SHOWCASE_ROOMS.length);
  });

  it("gives every showcase item a unique id, an image src and text keys", () => {
    const ids = new Set<string>();
    for (const it of SHOWCASE_ITEMS) {
      ids.add(it.id);
      expect(it.src.length).toBeGreaterThan(0);
      expect(it.altKey.startsWith("showcase.items.")).toBe(true);
      expect(it.titleKey.startsWith("showcase.items.")).toBe(true);
      expect(it.blurbKey.startsWith("showcase.items.")).toBe(true);
    }
    expect(ids.size).toBe(SHOWCASE_ITEMS.length);
  });

  it("exposes venue amenities with an icon, palette color and a photo", () => {
    expect(AMENITIES.length).toBeGreaterThan(0);
    for (const a of AMENITIES) {
      expect(typeof a.icon).toBe("object");
      expect(a.color.startsWith("var(--color-")).toBe(true);
      expect(a.src.length).toBeGreaterThan(0);
      expect(a.titleKey.startsWith("showcase.items.")).toBe(true);
    }
  });
});
