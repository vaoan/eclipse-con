import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CtaBand } from "@/sections/CtaBand";

// `t` returns the key under test (see test-setup): assertions name i18n keys.
describe("CtaBand", () => {
  it("renders the closing title and follow CTA", () => {
    render(<CtaBand />);
    expect(
      screen.getByRole("heading", { name: "cta.title" })
    ).toBeInTheDocument();
    expect(screen.getByTestId("teaser-follow")).toHaveAttribute(
      "data-cta-id",
      "teaser_follow"
    );
  });

  it("closes the page with the footer inside the same section", () => {
    render(<CtaBand />);
    expect(screen.getByTestId("cta-band")).toContainElement(
      screen.getByTestId("site-footer")
    );
  });
});
