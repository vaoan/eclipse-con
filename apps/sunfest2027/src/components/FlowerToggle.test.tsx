import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FlowerToggle } from "@/components/FlowerToggle";
import { setFlowerShower } from "@/lib/useFlowerShower";

describe("FlowerToggle", () => {
  afterEach(() => {
    setFlowerShower(true);
    localStorage.clear();
  });

  it("defaults to on and toggles the flower shower off and back on", () => {
    render(<FlowerToggle />);
    const toggle = screen.getByTestId("flower-toggle");
    expect(toggle).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "true");
  });
});
