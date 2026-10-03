import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BarList } from "@/components/BarList";
import { Heatmap } from "@/components/Heatmap";

const ITEMS = Array.from({ length: 10 }, (_, index) => ({
  key: `k${String(index)}`,
  label: `item ${String(index)}`,
  count: 10 - index,
  uniques: 1,
}));

describe("BarList", () => {
  it("shows eight rows, then all on expand", () => {
    render(<BarList id="country" title="breakdown.country" items={ITEMS} />);
    expect(screen.getAllByRole("row")).toHaveLength(9);
    fireEvent.click(screen.getByRole("button", { name: "+2" }));
    expect(screen.getAllByRole("row")).toHaveLength(11);
  });

  it("shows the empty state", () => {
    render(<BarList id="country" title="breakdown.country" items={[]} />);
    expect(screen.getByText("breakdown.empty")).toBeInTheDocument();
  });
});

describe("Heatmap", () => {
  it("labels every weekday × hour cell", () => {
    render(
      <Heatmap
        includeBots={false}
        hours={[
          {
            date: "2026-10-03",
            hour: "15",
            clicks: 4,
            uniques: 4,
            bots: 0,
            previews: 0,
          },
        ]}
      />
    );
    expect(
      screen.getByRole("heading", { name: "heatmap.title" })
    ).toBeInTheDocument();
    expect(screen.getAllByText("heatmap.cell")).toHaveLength(7 * 24);
    expect(
      screen.getByRole("rowheader", { name: "heatmap.weekdays.5" })
    ).toBeInTheDocument();
  });
});
