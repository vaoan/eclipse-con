import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Recap } from "@/sections/Recap";

// `t` returns the key under test (see test-setup): assertions name i18n keys.
describe("Recap", () => {
  it("renders the thank-you heading, the attendee count and country flags", () => {
    render(<Recap />);
    expect(
      screen.getByRole("heading", { name: "recap.title" })
    ).toBeInTheDocument();
    expect(screen.getByText("224")).toBeInTheDocument();
    // Countries render (twice, for the marquee loop) under allowed motion.
    expect(screen.getAllByText("recap.countries.mx").length).toBeGreaterThan(0);
  });
});
