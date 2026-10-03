import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TimeSeriesChart } from "@/components/TimeSeriesChart";

const POINTS = [
  { key: "a", label: "1 oct", clicks: 4, uniques: 3 },
  { key: "b", label: "2 oct", clicks: 9, uniques: 6 },
];

describe("TimeSeriesChart", () => {
  it("has a legend for both series", () => {
    render(
      <TimeSeriesChart
        title="chart.title"
        xLabel="chart.date"
        points={POINTS}
      />
    );
    expect(
      screen.getByRole("img", { name: "chart.title" })
    ).toBeInTheDocument();
    expect(screen.getByText("chart.clicks")).toBeInTheDocument();
    expect(screen.getByText("chart.uniques")).toBeInTheDocument();
  });

  it("switches to a table with the same numbers", () => {
    render(
      <TimeSeriesChart
        title="chart.title"
        xLabel="chart.date"
        points={POINTS}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "chart.showTable" }));
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(
      screen.getByRole("rowheader", { name: "2 oct" })
    ).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "9" })).toBeInTheDocument();
  });

  it("shows the readout from the keyboard", () => {
    render(
      <TimeSeriesChart
        title="chart.title"
        xLabel="chart.date"
        points={POINTS}
      />
    );
    const plot = screen.getByRole("img", { name: "chart.title" });
    fireEvent.keyDown(plot, { key: "ArrowRight" });
    expect(screen.getByRole("status")).toHaveTextContent("1 oct");
    fireEvent.keyDown(plot, { key: "ArrowRight" });
    expect(screen.getByRole("status")).toHaveTextContent("2 oct");
  });

  it("says when the period has no clicks", () => {
    render(
      <TimeSeriesChart
        title="chart.title"
        xLabel="chart.date"
        points={POINTS.map((point) => ({ ...point, clicks: 0, uniques: 0 }))}
      />
    );
    expect(screen.getByText("chart.empty")).toBeInTheDocument();
  });
});
