import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VenueGallery } from "@/sections/VenueGallery";

describe("VenueGallery", () => {
  it("renders every venue photo with translated alt text and a caption", () => {
    render(<VenueGallery />);
    const imgs = screen.getAllByRole("img");
    expect(imgs).toHaveLength(6);
    for (const img of imgs) {
      expect(img.getAttribute("alt")).toBeTruthy();
    }
    expect(
      screen.getByText(/Pool & solarium|Piscina & solárium/)
    ).toBeInTheDocument();
  });
});
