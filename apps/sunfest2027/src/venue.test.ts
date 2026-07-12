import { describe, expect, it } from "vitest";
import { HIGHLIGHTS } from "@/venue";

describe("venue data", () => {
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
