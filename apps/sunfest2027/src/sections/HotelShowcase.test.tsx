import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HotelShowcase } from "@/sections/HotelShowcase";

describe("HotelShowcase", () => {
  it("renders the giant pool feature and room cards", () => {
    render(<HotelShowcase />);
    expect(
      screen.getByRole("heading", { name: /warm corner|rincón cálido/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /giant pool|piscina gigante/i })
    ).toBeInTheDocument();
  });

  it("opens the lightbox when a photo is clicked and closes it again", () => {
    render(<HotelShowcase />);
    expect(screen.queryByTestId("lightbox")).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /giant pool|piscina gigante/i })
    );
    const lightbox = screen.getByTestId("lightbox");
    expect(lightbox).toBeInTheDocument();
    expect(lightbox).toHaveAttribute("role", "dialog");

    fireEvent.click(screen.getByRole("button", { name: /close|cerrar/i }));
    expect(screen.queryByTestId("lightbox")).not.toBeInTheDocument();
  });
});
