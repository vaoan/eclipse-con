import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "@/App";

describe("Teaser", () => {
  it("renders the wordmark and a tracked follow CTA", () => {
    render(<App />);
    expect(
      screen.getByRole("heading", { name: "Sunfest 2027" })
    ).toBeInTheDocument();
    const cta = screen.getByRole("link");
    expect(cta).toHaveAttribute("data-content-id", "follow_telegram");
    expect(cta).toHaveAttribute("data-cta-id", "teaser_follow");
    expect(cta).toHaveAttribute("data-funnel-step", "follow");
  });
});
