import { describe, expect, it } from "vitest";
import { buildClick, recordClick } from "./capture";
import { MISS_SLUG, runRollup } from "./rollup";
import { createTestDatabase } from "./test/d1";
import { GOOGLEBOT_UA, makeRequest, WHATSAPP_UA } from "./test/requests";

const NOW = Date.UTC(2026, 9, 3, 20, 30);
const KEY = "k";

/** Records one click from a given IP/UA on a slug. */
async function click(
  database: D1Database,
  slug: string,
  options: {
    ip?: string;
    userAgent?: string;
    miss?: boolean;
    now?: number;
  } = {}
): Promise<void> {
  const headers: Record<string, string> = {};
  if (options.ip) {
    headers["cf-connecting-ip"] = options.ip;
  }
  if (options.userAgent) {
    headers["user-agent"] = options.userAgent;
  }
  await recordClick(
    database,
    await buildClick(makeRequest(`https://fco.bz/${slug}`, headers), {
      slug,
      miss: options.miss ?? false,
      now: options.now ?? NOW,
      hashKey: KEY,
    })
  );
}

describe("runRollup", () => {
  it("aggregates clicks, uniques, bots and previews per day and dimension", async () => {
    const { database, raw } = createTestDatabase();
    await click(database, "s27", { ip: "198.51.100.1" });
    await click(database, "s27", { ip: "198.51.100.1" });
    await click(database, "s27", { ip: "198.51.100.2" });
    await click(database, "s27", { userAgent: GOOGLEBOT_UA });
    await click(database, "s27", { userAgent: WHATSAPP_UA });
    await click(database, "s72", { miss: true });

    const result = await runRollup(database, NOW);
    expect(result).toEqual({ from: 0, to: 6 });

    const total = raw
      .prepare(
        "SELECT clicks, uniques, bots, previews FROM daily_stats WHERE slug = 's27' AND dim = 'total'"
      )
      .get();
    expect(total).toEqual({ clicks: 3, uniques: 2, bots: 1, previews: 1 });

    expect(
      raw
        .prepare(
          "SELECT value, clicks FROM daily_stats WHERE slug = 's27' AND dim = 'country'"
        )
        .all()
    ).toEqual([{ value: "CO", clicks: 3 }]);
    expect(
      raw
        .prepare(
          "SELECT value, previews FROM daily_stats WHERE slug = 's27' AND dim = 'preview_app' AND value != ''"
        )
        .all()
    ).toEqual([{ value: "whatsapp", previews: 1 }]);
    expect(
      raw
        .prepare(
          "SELECT value FROM daily_stats WHERE slug = 's27' AND dim = 'hour'"
        )
        .all()
    ).toEqual([{ value: "15" }]);
    expect(
      raw
        .prepare(
          "SELECT value FROM daily_stats WHERE slug = 's27' AND dim = 'city'"
        )
        .all()
    ).toEqual([{ value: "CO|Bogotá" }]);
    expect(
      raw
        .prepare(
          "SELECT value, clicks FROM daily_stats WHERE slug = ? AND dim = 'requested'"
        )
        .all(MISS_SLUG)
    ).toEqual([{ value: "s72", clicks: 1 }]);
    expect(
      raw
        .prepare("SELECT slug, clicks, uniques, last_click_at FROM link_stats")
        .all()
    ).toEqual([{ slug: "s27", clicks: 3, uniques: 2, last_click_at: NOW }]);
  });

  it("is incremental: a second run adds only new clicks", async () => {
    const { database, raw } = createTestDatabase();
    await click(database, "s27", { ip: "198.51.100.1" });
    await runRollup(database, NOW);
    await runRollup(database, NOW + 60_000);
    await click(database, "s27", { ip: "198.51.100.2", now: NOW + 120_000 });
    const second = await runRollup(database, NOW + 180_000);

    expect(second).toEqual({ from: 1, to: 2 });
    expect(
      raw
        .prepare("SELECT clicks, uniques FROM daily_stats WHERE dim = 'total'")
        .get()
    ).toEqual({ clicks: 2, uniques: 2 });
    expect(
      raw.prepare("SELECT clicks, last_click_at FROM link_stats").get()
    ).toEqual({
      clicks: 2,
      last_click_at: NOW + 120_000,
    });
  });

  it("does nothing when there are no new clicks", async () => {
    const { database, raw } = createTestDatabase();
    expect(await runRollup(database, NOW)).toEqual({ from: 0, to: 0 });
    expect(raw.prepare("SELECT ran_at FROM rollup_cursor").get()).toEqual({
      ran_at: NOW,
    });
  });
});
