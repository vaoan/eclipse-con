import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Highlights } from "@/sections/Highlights";

describe("Highlights", () => {
  it("renders a card for every highlight", () => {
    render(<Highlights />);
    expect(
      screen.getByText(/Coffee culture|Cultura cafetera/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Carnival nights|Noches de carnaval/)
    ).toBeInTheDocument();
  });
});
