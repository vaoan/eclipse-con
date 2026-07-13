import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WhatIsSunfest } from "@/sections/WhatIsSunfest";

// `t` returns the key under test (see test-setup): assertions name i18n keys.
describe("WhatIsSunfest", () => {
  it("renders its heading and body from their keys", () => {
    render(<WhatIsSunfest />);
    expect(
      screen.getByRole("heading", { name: "about.title" })
    ).toBeInTheDocument();
    expect(screen.getByText("about.body")).toBeInTheDocument();
  });
});
