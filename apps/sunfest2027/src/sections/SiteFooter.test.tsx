import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteFooter } from "@/sections/SiteFooter";

describe("SiteFooter", () => {
  it("renders the rights line and the social links again", () => {
    render(<SiteFooter />);
    expect(
      screen.getByText(/all rights reserved|derechos reservados/i)
    ).toBeInTheDocument();
    const instagram = screen.getByRole("link", { name: /instagram/i });
    expect(instagram).toHaveAttribute("data-content-section", "footer");
  });
});
