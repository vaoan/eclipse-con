import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Amenities } from "@/sections/Amenities";

// `t` returns the key under test (see test-setup): assertions name i18n keys.
describe("Amenities", () => {
  it("renders the heading, amenity cards and the 'more' checklist", () => {
    render(<Amenities />);
    expect(
      screen.getByRole("heading", { name: "amenities.title" })
    ).toBeInTheDocument();
    expect(screen.getByTestId("amenity-spa")).toBeInTheDocument();
    expect(screen.getByTestId("amenity-restaurant")).toBeInTheDocument();
    expect(screen.getByText("amenities.more.gym")).toBeInTheDocument();
    expect(screen.getByText("amenities.more.wifi")).toBeInTheDocument();
  });

  it("opens the lightbox when an amenity is clicked", () => {
    render(<Amenities />);
    expect(screen.queryByTestId("lightbox")).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId("amenity-spa"));
    expect(screen.getByTestId("lightbox")).toHaveAttribute("role", "dialog");
  });
});
