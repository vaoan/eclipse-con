import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Hero } from "@/sections/Hero";

// `t` returns the key under test (see test-setup): assertions name i18n keys.
describe("Hero", () => {
  it("renders the wordmark heading from its key", () => {
    render(<Hero />);
    expect(
      screen.getByRole("heading", { name: "teaser.wordmark" })
    ).toBeInTheDocument();
  });

  it("renders the Sunfest illustration with its alt-text key", () => {
    render(<Hero />);
    const banner = screen.getByRole("img");
    expect(banner).toHaveClass("hero-banner");
    expect(banner).toHaveAttribute("alt", "teaser.bannerAlt");
  });
});
