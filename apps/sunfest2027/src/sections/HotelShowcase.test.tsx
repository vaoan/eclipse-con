import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HotelShowcase } from "@/sections/HotelShowcase";

// `t` returns the key under test (see test-setup): assertions name i18n keys.
describe("HotelShowcase", () => {
  it("renders the section heading and the giant pool feature", () => {
    render(<HotelShowcase />);
    expect(
      screen.getByRole("heading", { name: "showcase.title" })
    ).toBeInTheDocument();
    expect(screen.getByTestId("showcase-feature")).toBeInTheDocument();
  });

  it("opens the lightbox when the feature is clicked and closes it again", () => {
    render(<HotelShowcase />);
    expect(screen.queryByTestId("lightbox")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("showcase-feature"));
    const lightbox = screen.getByTestId("lightbox");
    expect(lightbox).toHaveAttribute("role", "dialog");

    fireEvent.click(screen.getByRole("button", { name: "lightbox.close" }));
    expect(screen.queryByTestId("lightbox")).not.toBeInTheDocument();
  });
});
