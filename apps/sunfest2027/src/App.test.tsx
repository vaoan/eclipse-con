import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "@/App";

describe("Teaser", () => {
  it("renders the hero wordmark and a tracked follow CTA", () => {
    render(<App />);
    expect(
      screen.getByRole("heading", { name: "Sunfest 2027" })
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
    expect(screen.getByTestId("highlights")).toBeInTheDocument();
    expect(screen.getByTestId("cta-band")).toBeInTheDocument();
    expect(screen.getByTestId("site-footer")).toBeInTheDocument();
  });

  it("renders the Furry Colombia social links in the CTA band and the footer", () => {
    render(<App />);
    const instagram = screen.getAllByRole("link", { name: /instagram/i });
    expect(instagram).toHaveLength(2);
    for (const link of instagram) {
      expect(link).toHaveAttribute("data-content-id", "social_instagram");
    }
  });
});
