import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Amenities } from "@/sections/Amenities";

// `t` returns the key under test (see test-setup): assertions name i18n keys.
describe("Amenities", () => {
  it("renders the heading and an amenity card per amenity", () => {
    render(<Amenities />);
    expect(
      screen.getByRole("heading", { name: "amenities.title" })
    ).toBeInTheDocument();
    expect(screen.getByTestId("amenity-spa")).toBeInTheDocument();
    expect(screen.getByTestId("amenity-restaurant")).toBeInTheDocument();
  });

  it("opens the lightbox when an amenity is clicked", () => {
    render(<Amenities />);
    expect(screen.queryByTestId("lightbox")).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId("amenity-spa"));
    expect(screen.getByTestId("lightbox")).toHaveAttribute("role", "dialog");
  });
});
