import { describe, expect, it } from "vitest";
import { isHttpsUrl, isValidSlug, slugFromPath } from "./slug";

describe("slugFromPath", () => {
  it("takes the first segment, lowercased and decoded", () => {
    expect(slugFromPath("/S27")).toBe("s27");
    expect(slugFromPath("/s27/")).toBe("s27");
    expect(slugFromPath("/s27/extra")).toBe("s27");
    expect(slugFromPath("/caf%C3%A9")).toBe("café");
  });

  it("returns empty for the root", () => {
    expect(slugFromPath("/")).toBe("");
  });

  it("keeps malformed escapes as-is instead of throwing", () => {
    expect(slugFromPath("/%E0%A4%A")).toBe("%e0%a4%a");
  });
});

describe("isValidSlug", () => {
  it.each(["s27", "sunfest-2027", "a", "x".repeat(32)])(
    "accepts %s",
    (slug) => {
      expect(isValidSlug(slug)).toBe(true);
    }
  );

  it.each(["", "S27", "s 27", "s_27", "café", "x".repeat(33), "s27/"])(
    "rejects %j",
    (slug) => {
      expect(isValidSlug(slug)).toBe(false);
    }
  );
});

describe("isHttpsUrl", () => {
  it("accepts absolute https URLs", () => {
    expect(isHttpsUrl("https://sunfest2027.furrycolombia.com")).toBe(true);
  });

  it.each([
    "ftp://example.com",
    "sunfest2027.furrycolombia.com",
    "https://",
    "",
  ])("rejects %j", (value) => {
    expect(isHttpsUrl(value)).toBe(false);
  });
});
