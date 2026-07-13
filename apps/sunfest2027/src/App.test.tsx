import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "@/App";

// `t` returns the key under test (see test-setup): assertions name i18n keys.
describe("Teaser", () => {
  it("renders the hero wordmark and a tracked follow CTA", () => {
    render(<App />);
    expect(
      screen.getByRole("heading", { name: "teaser.wordmark" })
    ).toBeInTheDocument();
    const cta = screen.getByTestId("teaser-follow");
    expect(cta).toHaveAttribute("data-content-id", "follow_telegram");
    expect(cta).toHaveAttribute("data-cta-id", "teaser_follow");
    expect(cta).toHaveAttribute("data-funnel-step", "follow");
  });

  it("renders all teaser sections", () => {
    render(<App />);
    expect(screen.getByTestId("hero")).toBeInTheDocument();
    expect(screen.getByTestId("about")).toBeInTheDocument();
    expect(screen.getByTestId("showcase")).toBeInTheDocument();
    expect(screen.getByTestId("amenities")).toBeInTheDocument();
    expect(screen.getByTestId("cta-band")).toBeInTheDocument();
    expect(screen.getByTestId("site-footer")).toBeInTheDocument();
  });

  it("renders the Furry Colombia social links once, in the footer", () => {
    render(<App />);
    const instagram = screen.getAllByRole("link", { name: /instagram/i });
    expect(instagram).toHaveLength(1);
    expect(instagram[0]).toHaveAttribute("data-content-id", "social_instagram");
    expect(instagram[0]).toHaveAttribute("data-content-section", "footer");
  });
});
