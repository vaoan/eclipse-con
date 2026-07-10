import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Hero } from "@/sections/Hero";

describe("Hero", () => {
  it("renders the wordmark heading", () => {
    render(<Hero />);
    expect(
      screen.getByRole("heading", { name: "Sunfest 2027" })
    ).toBeInTheDocument();
  });
});
