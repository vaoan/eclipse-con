import { describe, expect, it } from "vitest";
import { handleApi, type ApiContext } from "./api";
import { csvField, EXPORT_COLUMNS } from "./backup";
import { buildClick, recordClick } from "./capture";
import type { Env } from "./env";
import { runRollup } from "./rollup";
import { createTestDatabase } from "./test/d1";
import { makeRequest } from "./test/requests";

const NOW = Date.UTC(2026, 9, 3, 20, 30);

/** D1 seeded with two links of one campaign plus some clicks, rolled up. */
async function seeded(clicks = 3) {
  const { database, raw } = createTestDatabase();
  raw.exec(`INSERT INTO links (slug, destination, campaign, active, first_seen, updated_at) VALUES
    ('s27', 'https://sunfest2027.furrycolombia.com/', 'sunfest2027', 1, 0, 0),
    ('s27t', 'https://sunfest2027.furrycolombia.com/', 'sunfest2027', 1, 0, 0),
    ('gone', 'https://example.org/', NULL, 1, 0, 0)`);
  raw.exec("UPDATE links SET in_sheet = 0 WHERE slug = 'gone'");
  for (let index = 0; index < clicks; index += 1) {
    const slug = index % 2 === 0 ? "s27" : "s27t";
    await recordClick(
      database,
      await buildClick(
        makeRequest(`https://fco.bz/${slug}`, {
          "cf-connecting-ip": `198.51.100.${index}`,
        }),
        { slug, miss: false, now: NOW + index, hashKey: "k" }
      )
    );
  }
  await runRollup(database, NOW);
  const context: ApiContext = {
    env: { DB: database, LINKS_SHEET_ID: "sheet-123" } as unknown as Env,
    identity: { email: "furrycolombia@gmail.com", serviceToken: null },
    now: NOW,
    fetcher: () => Promise.reject(new Error("no network in tests")),
    cache: undefined,
  };
  return { context, raw };
}

/** Calls the API with a path. */
function call(context: ApiContext, path: string, init?: RequestInit) {
  return handleApi(new Request(`https://admin.fco.bz${path}`, init), context);
}

describe("handleApi", () => {
  it("GET /api/me returns the identity and the Sheet link", async () => {
    const { context } = await seeded(0);
    const body = await (await call(context, "/api/me")).json();
    expect(body).toEqual({
      email: "furrycolombia@gmail.com",
      serviceToken: null,
      sheetUrl: "https://docs.google.com/spreadsheets/d/sheet-123/edit",
    });
  });

  it("GET /api/links lists links with lifetime totals", async () => {
    const { context } = await seeded();
    const body = await (
      await call(context, "/api/links")
    ).json<{
      links: { slug: string; clicks: number; in_sheet: number }[];
    }>();
    const bySlug = Object.fromEntries(
      body.links.map((link) => [link.slug, link])
    );
    expect(bySlug.s27?.clicks).toBe(2);
    expect(bySlug.s27t?.clicks).toBe(1);
    expect(bySlug.gone?.in_sheet).toBe(0);
  });

  it("GET /api/stats aggregates a campaign", async () => {
    const { context } = await seeded();
    const response = await call(
      context,
      "/api/stats?campaign=sunfest2027&from=2026-10-01&to=2026-10-03"
    );
    const body = await response.json<{
      series: { date: string; clicks: number; uniques: number }[];
      dims: Record<string, { value: string; clicks: number }[]>;
    }>();
    expect(body.series).toEqual([
      expect.objectContaining({ date: "2026-10-03", clicks: 3, uniques: 3 }),
    ]);
    expect(body.dims.country).toEqual([
      expect.objectContaining({ value: "CO", clicks: 3 }),
    ]);
    expect(body.dims.device).toEqual([
      expect.objectContaining({ value: "mobile", clicks: 3 }),
    ]);
  });

  it("GET /api/stats for one slug", async () => {
    const { context } = await seeded();
    const body = await (
      await call(context, "/api/stats?slug=s27t")
    ).json<{
      series: { clicks: number }[];
    }>();
    expect(body.series.map((point) => point.clicks)).toEqual([1]);
  });

  it("GET /api/sync reports state and slugs missing from the Sheet", async () => {
    const { context } = await seeded(0);
    const body = await (
      await call(context, "/api/sync")
    ).json<{
      missing: { slug: string }[];
      statsUpdatedAt: number;
    }>();
    expect(body.missing.map((link) => link.slug)).toEqual(["gone"]);
    expect(body.statsUpdatedAt).toBe(NOW);
  });

  it("POST requires X-Requested-With", async () => {
    const { context } = await seeded(0);
    const response = await call(context, "/api/sync", { method: "POST" });
    expect(response.status).toBe(403);
  });

  it("POST /api/sync reports not_configured without Google set up", async () => {
    const { context } = await seeded(0);
    const response = await call(context, "/api/sync", {
      method: "POST",
      headers: { "x-requested-with": "fetch" },
    });
    expect(await response.json()).toMatchObject({ skipped: true });
  });

  it("returns 404 for unknown routes", async () => {
    const { context } = await seeded(0);
    expect((await call(context, "/api/nope")).status).toBe(404);
  });
});

describe("GET /api/export.csv", () => {
  it("streams every click with a header row", async () => {
    const { context } = await seeded(3);
    const response = await call(
      context,
      "/api/export.csv?from=2026-10-03&to=2026-10-03"
    );
    const lines = (await response.text()).trim().split("\n");
    expect(response.headers.get("content-type")).toContain("text/csv");
    expect(lines[0]).toBe(EXPORT_COLUMNS.join(","));
    expect(lines).toHaveLength(4);
    expect(response.headers.get("x-next-after")).toBeNull();
  });

  it("pages with X-Next-After", async () => {
    const { context } = await seeded(5);
    const range = "from=2026-10-03&to=2026-10-03";
    const first = await call(context, `/api/export.csv?${range}&limit=2`);
    const next = first.headers.get("x-next-after");
    expect(next).toBe("2");
    expect((await first.text()).trim().split("\n")).toHaveLength(3);

    const second = await call(
      context,
      `/api/export.csv?${range}&limit=2&after=${next ?? ""}`
    );
    const secondLines = (await second.text()).trim().split("\n");
    expect(secondLines).toHaveLength(2);
    expect(secondLines[0]?.startsWith("3,")).toBe(true);
    expect(second.headers.get("x-next-after")).toBe("4");

    const third = await call(
      context,
      `/api/export.csv?${range}&limit=2&after=4`
    );
    expect((await third.text()).trim().split("\n")).toHaveLength(1);
    expect(third.headers.get("x-next-after")).toBeNull();
  });

  it("returns an empty file outside any clicks", async () => {
    const { context } = await seeded(2);
    const response = await call(
      context,
      "/api/export.csv?from=2020-01-01&to=2020-01-02"
    );
    expect(await response.text()).toBe("id\n");
  });
});

describe("csvField", () => {
  it("quotes commas, quotes and newlines", () => {
    expect(csvField('Telmex, "Claro"')).toBe('"Telmex, ""Claro"""');
    expect(csvField(null)).toBe("");
    expect(csvField(4.6)).toBe("4.6");
  });
});
