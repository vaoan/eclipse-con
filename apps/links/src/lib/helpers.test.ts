import { describe, expect, it } from "vitest";
import { countryCounts, labelFor, toBarItems } from "@/lib/breakdown";
import { bogotaDate, eachDay, mondayIndex, presetRange } from "@/lib/range";
import { niceTicks } from "@/lib/scale";
import { dailyPoints, hourlyPoints, totals } from "@/lib/series";
import { STATS } from "@/testFixtures";

const NOW = Date.UTC(2026, 9, 3, 20, 30);
const t = (key: string) => key;

describe("range", () => {
  it("uses Bogotá dates", () => {
    expect(bogotaDate(Date.UTC(2026, 9, 4, 3))).toBe("2026-10-03");
  });

  it("covers presets inclusively", () => {
    expect(presetRange("7d", NOW)).toEqual({
      from: "2026-09-27",
      to: "2026-10-03",
    });
    expect(presetRange("1d", NOW)).toEqual({
      from: "2026-10-02",
      to: "2026-10-03",
    });
  });

  it("lists every day and the Monday-first weekday", () => {
    expect(eachDay("2026-09-30", "2026-10-02")).toEqual([
      "2026-09-30",
      "2026-10-01",
      "2026-10-02",
    ]);
    expect(mondayIndex("2026-10-05")).toBe(0);
    expect(mondayIndex("2026-10-04")).toBe(6);
  });
});

describe("niceTicks", () => {
  it("rounds to clean steps", () => {
    expect(niceTicks(9)).toEqual([0, 5, 10]);
    expect(niceTicks(830)).toEqual([0, 500, 1000]);
    expect(niceTicks(130)).toEqual([0, 50, 100, 150]);
    expect(niceTicks(0)).toEqual([0, 1]);
  });
});

describe("series", () => {
  it("zero-fills days and adds bots on request", () => {
    expect(
      dailyPoints(STATS.series, "2026-10-02", "2026-10-03", false, "en").map(
        (p) => p.clicks
      )
    ).toEqual([0, 10]);
    expect(
      dailyPoints(STATS.series, "2026-10-02", "2026-10-03", true, "en").map(
        (p) => p.clicks
      )
    ).toEqual([0, 15]);
  });

  it("builds a rolling 24 hours ending now", () => {
    const points = hourlyPoints(STATS.hours, NOW, false);
    expect(points).toHaveLength(24);
    expect(points.at(-1)).toMatchObject({ label: "15:00", clicks: 10 });
  });

  it("sums totals", () => {
    expect(totals(STATS.series)).toEqual({
      clicks: 10,
      uniques: 8,
      bots: 2,
      previews: 3,
    });
  });
});

describe("breakdown", () => {
  it("labels places, referrers and devices", () => {
    expect(labelFor("city", "CO|Medellín", t, "es")).toBe(
      "Medellín · Colombia"
    );
    expect(labelFor("city", "CO|", t, "es")).toBe("breakdown.unknown");
    expect(labelFor("referrer_host", "", t, "es")).toBe("breakdown.direct");
    expect(labelFor("device", "mobile", t, "es")).toBe("device.mobile");
    expect(labelFor("country", "CO", t, "en")).toBe("Colombia");
  });

  it("counts previews for 'shared on' and drops empty values", () => {
    expect(
      toBarItems("preview_app", STATS.dims.preview_app ?? [], false, t, "en")
    ).toEqual([{ key: "whatsapp", label: "whatsapp", count: 3, uniques: 0 }]);
  });

  it("maps countries for the choropleth", () => {
    expect(countryCounts(STATS.dims.country ?? [], true)).toEqual({ CO: 13 });
  });
});
