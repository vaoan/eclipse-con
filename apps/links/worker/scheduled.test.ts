import { describe, expect, it } from "vitest";
import { runWeeklyExport } from "./backup";
import type { Env } from "./env";
import { dueJobs } from "./scheduled";
import { runNightlySummary } from "./summary";
import { createTestDatabase } from "./test/d1";
import { fakeGoogle, fakeServiceAccountJson } from "./test/google";

describe("dueJobs", () => {
  it("syncs every minute and rolls up every five", () => {
    expect(dueJobs(Date.UTC(2026, 9, 3, 20, 2))).toMatchObject({
      sync: true,
      rollup: true,
    });
    expect(dueJobs(Date.UTC(2026, 9, 3, 20, 3))).toMatchObject({
      sync: true,
      rollup: false,
    });
  });

  it("runs the summary at 06:30 UTC and the export Mondays at 07:00 UTC", () => {
    expect(dueJobs(Date.UTC(2026, 9, 3, 6, 30)).summary).toBe(true);
    expect(dueJobs(Date.UTC(2026, 9, 5, 7, 0)).weeklyExport).toBe(true);
    expect(dueJobs(Date.UTC(2026, 9, 6, 7, 0)).weeklyExport).toBe(false);
  });
});

describe("runNightlySummary", () => {
  it("appends yesterday's per-country rows once", async () => {
    const { database, raw } = createTestDatabase();
    raw.exec(`INSERT INTO daily_stats (date, slug, dim, value, clicks, uniques) VALUES
      ('2026-10-02', 's27', 'country', 'CO', 40, 31),
      ('2026-10-02', 's27', 'country', 'MX', 3, 3),
      ('2026-10-02', '~miss', 'country', 'CO', 9, 0),
      ('2026-10-01', 's27', 'country', 'CO', 7, 7)`);
    const google = fakeGoogle([]);
    const env = {
      DB: database,
      LINKS_SHEET_ID: "sheet",
      GOOGLE_SERVICE_ACCOUNT_JSON: await fakeServiceAccountJson(),
    } as unknown as Env;
    const now = Date.UTC(2026, 9, 3, 6, 30);

    expect(await runNightlySummary(env, now, google.fetcher)).toBe(2);
    expect(google.appended).toEqual([
      ["2026-10-02", "s27", "CO", 40, 31],
      ["2026-10-02", "s27", "MX", 3, 3],
    ]);
    expect(await runNightlySummary(env, now + 60_000, google.fetcher)).toBe(0);
    expect(google.appended).toHaveLength(2);
  });
});

describe("runWeeklyExport", () => {
  it("skips without an R2 binding", async () => {
    const { database } = createTestDatabase();
    expect(
      await runWeeklyExport(
        { DB: database } as unknown as Env,
        Date.UTC(2026, 9, 5, 7)
      )
    ).toBeNull();
  });

  it("writes last week's clicks as gzip CSV when a bucket is bound", async () => {
    const { database, raw } = createTestDatabase();
    raw.exec(`INSERT INTO clicks (slug, ts, day, hour) VALUES
      ('s27', ${Date.UTC(2026, 9, 1, 12)}, '2026-10-01', 7),
      ('s27', ${Date.UTC(2026, 8, 20, 12)}, '2026-09-20', 7)`);
    const puts: { key: string; size: number }[] = [];
    const bucket = {
      put: (key: string, body: ArrayBuffer) => {
        puts.push({ key, size: body.byteLength });
        return Promise.resolve(null);
      },
    } as unknown as R2Bucket;
    const key = await runWeeklyExport(
      { DB: database, BACKUP_BUCKET: bucket } as unknown as Env,
      Date.UTC(2026, 9, 5, 7)
    );
    expect(key).toBe("clicks/2026-W40.csv.gz");
    expect(puts).toHaveLength(1);
    expect(puts[0]?.size).toBeGreaterThan(0);
  });
});
