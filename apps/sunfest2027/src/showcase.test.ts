import { describe, expect, it } from "vitest";
import {
  SHOWCASE_FEATURE,
  SHOWCASE_GROUNDS,
  SHOWCASE_ITEMS,
  SHOWCASE_ROOMS,
} from "@/showcase";

describe("showcase data", () => {
  it("lists the feature, rooms and grounds in one flat lightbox order", () => {
    expect(SHOWCASE_ITEMS[0]).toBe(SHOWCASE_FEATURE);
    expect(SHOWCASE_ITEMS).toHaveLength(
      1 + SHOWCASE_ROOMS.length + SHOWCASE_GROUNDS.length
    );
  });

  it("gives every item a unique id, an image src and showcase-scoped text keys", () => {
    const ids = new Set<string>();
    for (const it of SHOWCASE_ITEMS) {
      ids.add(it.id);
      expect(typeof it.src).toBe("string");
      expect(it.src.length).toBeGreaterThan(0);
      expect(it.altKey.startsWith("showcase.items.")).toBe(true);
      expect(it.titleKey.startsWith("showcase.items.")).toBe(true);
      expect(it.blurbKey.startsWith("showcase.items.")).toBe(true);
    }
    expect(ids.size).toBe(SHOWCASE_ITEMS.length);
  });
});
