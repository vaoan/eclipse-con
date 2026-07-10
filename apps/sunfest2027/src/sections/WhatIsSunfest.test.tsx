import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WhatIsSunfest } from "@/sections/WhatIsSunfest";

describe("WhatIsSunfest", () => {
  it("renders its heading and body copy", () => {
    render(<WhatIsSunfest />);
    expect(
      screen.getByRole("heading", { name: /coffee region|Eje Cafetero/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Furry Colombia/)).toBeInTheDocument();
  });
});
