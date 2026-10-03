import { beforeEach, describe, expect, it } from "vitest";
import type { Env } from "./env";
import { resetLinkMemory } from "./linkCache";
import { resetTokenCache } from "./sheet";
import {
  parseSheetRows,
  planSync,
  runSync,
  STATUS,
  type SheetRow,
  type StoredLink,
} from "./sync";
import { createTestDatabase } from "./test/d1";
import { fakeGoogle, fakeServiceAccountJson } from "./test/google";

const NOW = Date.UTC(2026, 9, 3, 20, 30);
const SUNFEST = "https://sunfest2027.furrycolombia.com/";

/** A valid, active sheet row. */
function row(overrides: Partial<SheetRow> = {}): SheetRow {
  return {
    row: 2,
    slug: "s27",
    destination: SUNFEST,
    label: "Magnet QR",
    campaign: "sunfest2027",
    active: true,
    status: "",
    ...overrides,
  };
}

/** A stored link matching {@link row}'s defaults. */
function stored(overrides: Partial<StoredLink> = {}): StoredLink {
  return {
    slug: "s27",
    destination: SUNFEST,
    label: "Magnet QR",
    campaign: "sunfest2027",
    active: 1,
    in_sheet: 1,
    sheet_row: 2,
    ...overrides,
  };
}

describe("parseSheetRows", () => {
  it("reads checkboxes, trims, lowercases slugs and skips blank lines", () => {
    expect(
      parseSheetRows([
        [" S27 ", SUNFEST, "Magnet", "Sunfest2027", true, "✓ activo"],
        [],
        ["", ""],
        ["tg", SUNFEST, "", "", false],
        ["web", SUNFEST],
      ])
    ).toEqual([
      row({ label: "Magnet", status: "✓ activo" }),
      row({ row: 5, slug: "tg", label: "", campaign: "", active: false }),
      row({ row: 6, slug: "web", label: "", campaign: "", active: true }),
    ]);
  });
});

describe("planSync", () => {
  it("adds a new link and marks it live", () => {
    const plan = planSync([row()], []);
    expect(plan.upserts).toEqual([
      {
        slug: "s27",
        destination: SUNFEST,
        label: "Magnet QR",
        campaign: "sunfest2027",
        active: 1,
        sheet_row: 2,
      },
    ]);
    expect(plan.statuses).toEqual([{ row: 2, status: STATUS.live }]);
  });

  it("changes nothing when the Sheet matches D1 and the status is current", () => {
    const plan = planSync([row({ status: STATUS.live })], [stored()]);
    expect(plan).toMatchObject({
      upserts: [],
      missing: [],
      statuses: [],
      errors: [],
    });
  });

  it("keeps the last good destination when a row turns invalid", () => {
    const plan = planSync([row({ destination: "sunfest.com" })], [stored()]);
    expect(plan.upserts).toEqual([]);
    expect(plan.missing).toEqual([]);
    expect(plan.errors).toEqual([
      { row: 2, slug: "s27", reason: STATUS.badDestination },
    ]);
    expect(plan.statuses).toEqual([
      { row: 2, status: `${STATUS.badDestination}${STATUS.keptPrevious}` },
    ]);
  });

  it("rejects malformed slugs", () => {
    const plan = planSync([row({ slug: "s 27" })], []);
    expect(plan.upserts).toEqual([]);
    expect(plan.errors[0]?.reason).toBe(STATUS.badSlug);
  });

  it("lets the first of duplicate slugs win and reports the rest", () => {
    const plan = planSync(
      [row(), row({ row: 3, destination: "https://example.org/" })],
      []
    );
    expect(plan.upserts.map((link) => link.destination)).toEqual([SUNFEST]);
    expect(plan.errors).toEqual([
      { row: 3, slug: "s27", reason: STATUS.duplicate(2) },
    ]);
  });

  it("keeps a deleted row's link live, flagged as missing", () => {
    const plan = planSync([], [stored()]);
    expect(plan.missing).toEqual(["s27"]);
    expect(plan.upserts).toEqual([]);
  });

  it("does not re-flag a link already missing", () => {
    expect(planSync([], [stored({ in_sheet: 0 })]).missing).toEqual([]);
  });

  it("restores a link whose row comes back", () => {
    const plan = planSync(
      [row({ status: STATUS.live })],
      [stored({ in_sheet: 0 })]
    );
    expect(plan.upserts).toHaveLength(1);
  });

  it("pauses a link when active is unticked", () => {
    const plan = planSync([row({ active: false })], [stored()]);
    expect(plan.upserts[0]?.active).toBe(0);
    expect(plan.statuses).toEqual([{ row: 2, status: STATUS.paused }]);
  });
});

describe("runSync", () => {
  beforeEach(() => {
    resetLinkMemory();
    resetTokenCache();
  });

  it("syncs the Sheet into D1 and writes statuses back", async () => {
    const { database, raw } = createTestDatabase();
    const google = fakeGoogle([
      ["s27", SUNFEST, "Magnet QR", "sunfest2027", true],
      ["S 27", SUNFEST, "typo", "", true],
    ]);
    const env = {
      DB: database,
      LINKS_SHEET_ID: "sheet-id",
      GOOGLE_SERVICE_ACCOUNT_JSON: await fakeServiceAccountJson(),
    } as unknown as Env;

    const result = await runSync(env, {
      now: NOW,
      fetcher: google.fetcher,
      cache: undefined,
    });

    expect(result).toMatchObject({ ok: true, rows: 2, changed: 1 });
    expect(
      raw.prepare("SELECT slug, destination, in_sheet FROM links").all()
    ).toEqual([{ slug: "s27", destination: SUNFEST, in_sheet: 1 }]);
    expect(google.grid[0]?.[5]).toBe(STATUS.live);
    expect(google.grid[1]?.[5]).toBe(STATUS.badSlug);
    expect(raw.prepare("SELECT ok, changed FROM sync_state").get()).toEqual({
      ok: 1,
      changed: 1,
    });
    expect(raw.prepare("SELECT COUNT(*) AS n FROM sync_runs").get()).toEqual({
      n: 1,
    });
  });

  it("does not log a quiet run or rewrite unchanged statuses", async () => {
    const { database, raw } = createTestDatabase();
    const google = fakeGoogle([["s27", SUNFEST, "", "", true]]);
    const env = {
      DB: database,
      LINKS_SHEET_ID: "sheet-id",
      GOOGLE_SERVICE_ACCOUNT_JSON: await fakeServiceAccountJson(),
    } as unknown as Env;
    const deps = { now: NOW, fetcher: google.fetcher, cache: undefined };

    await runSync(env, deps);
    const callsAfterFirst = google.calls.length;
    const second = await runSync(env, { ...deps, now: NOW + 60_000 });

    expect(second.changed).toBe(0);
    expect(raw.prepare("SELECT COUNT(*) AS n FROM sync_runs").get()).toEqual({
      n: 1,
    });
    const secondCalls = google.calls.slice(callsAfterFirst);
    expect(secondCalls.some((call) => call.url.includes(":batchUpdate"))).toBe(
      false
    );
  });

  it("reports not_configured without a Sheet or service account", async () => {
    const { database, raw } = createTestDatabase();
    const result = await runSync({ DB: database } as unknown as Env, {
      now: NOW,
      fetcher: () => Promise.reject(new Error("should not be called")),
      cache: undefined,
    });
    expect(result).toMatchObject({
      ok: false,
      skipped: true,
      message: "not_configured",
    });
    expect(raw.prepare("SELECT message FROM sync_state").get()).toEqual({
      message: "not_configured",
    });
  });

  it("records a Google failure instead of throwing", async () => {
    const { database, raw } = createTestDatabase();
    const env = {
      DB: database,
      LINKS_SHEET_ID: "sheet-id",
      GOOGLE_SERVICE_ACCOUNT_JSON: await fakeServiceAccountJson(),
    } as unknown as Env;
    const result = await runSync(env, {
      now: NOW,
      fetcher: () => Promise.resolve(new Response("nope", { status: 500 })),
      cache: undefined,
    });
    expect(result.ok).toBe(false);
    expect(raw.prepare("SELECT ok FROM sync_state").get()).toEqual({ ok: 0 });
  });
});
