import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CtaBand } from "@/sections/CtaBand";

describe("CtaBand", () => {
  it("renders the closing title, follow CTA and socials", () => {
    render(<CtaBand />);
    expect(
      screen.getByRole("heading", { name: /waiting|esperando/i })
    ).toBeInTheDocument();
    expect(screen.getByTestId("teaser-follow")).toHaveAttribute(
      "data-cta-id",
      "teaser_follow"
    );
    expect(
      screen.getByRole("link", { name: /instagram/i })
    ).toBeInTheDocument();
  });
});
