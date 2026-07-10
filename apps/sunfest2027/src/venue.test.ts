import { describe, expect, it } from "vitest";
import { HIGHLIGHTS, VENUE_PHOTOS } from "@/venue";

describe("venue data", () => {
  it("exposes six photos with src, alt key and caption key", () => {
    expect(VENUE_PHOTOS).toHaveLength(6);
    for (const photo of VENUE_PHOTOS) {
      expect(typeof photo.src).toBe("string");
      expect(photo.src.length).toBeGreaterThan(0);
      expect(photo.altKey.startsWith("venue.")).toBe(true);
      expect(photo.captionKey.startsWith("venue.")).toBe(true);
    }
  });

  it("exposes six highlight cards with an icon, label key and palette color", () => {
    expect(HIGHLIGHTS).toHaveLength(6);
    for (const card of HIGHLIGHTS) {
      // lucide-react@0.577.0 exports icons as React.forwardRef components
      // ($$typeof: Symbol(react.forward_ref)), so typeof is "object", not "function".
      expect(typeof card.icon).toBe("object");
      expect(card.labelKey.startsWith("highlights.")).toBe(true);
      expect(card.color.startsWith("var(--color-")).toBe(true);
    }
  });
});
