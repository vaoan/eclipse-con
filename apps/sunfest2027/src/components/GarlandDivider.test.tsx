import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GarlandDivider } from "@/components/GarlandDivider";

describe("GarlandDivider", () => {
  it("renders a decorative, hidden divider", () => {
    const { container } = render(<GarlandDivider />);
    const element = container.querySelector(".garland-divider");
    expect(element).not.toBeNull();
    expect(element).toHaveAttribute("aria-hidden", "true");
  });
});
