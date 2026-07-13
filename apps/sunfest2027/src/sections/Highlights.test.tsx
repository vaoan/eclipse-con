import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Highlights } from "@/sections/Highlights";

// `t` returns the key under test (see test-setup): assertions name i18n keys.
describe("Highlights", () => {
  it("renders a card for every highlight, labelled by its key", () => {
    render(<Highlights />);
    expect(screen.getByText("highlights.coffee")).toBeInTheDocument();
    expect(screen.getByText("highlights.carnaval")).toBeInTheDocument();
  });
});
