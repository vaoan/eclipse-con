import type { LinksResponse, Me, StatsResponse, SyncResponse } from "@/types";

/** Shared API fixtures for dashboard tests. */
export const ME: Me = {
  email: "furrycolombia@gmail.com",
  serviceToken: null,
  sheetUrl: "https://docs.google.com/spreadsheets/d/abc/edit",
};

/** Two sunfest links and one deleted from the Sheet. */
export const LINKS: LinksResponse = {
  links: [
    {
      slug: "s27",
      destination: "https://sunfest2027.furrycolombia.com/",
      label: "Magnet QR",
      campaign: "sunfest2027",
      active: 1,
      in_sheet: 1,
      sheet_row: 2,
      first_seen: 0,
      updated_at: 0,
      clicks: 120,
      uniques: 90,
      bots: 4,
      previews: 7,
      last_click_at: Date.UTC(2026, 9, 3, 20),
    },
    {
      slug: "s27t",
      destination: "https://sunfest2027.furrycolombia.com/",
      label: "Telegram",
      campaign: "sunfest2027",
      active: 0,
      in_sheet: 1,
      sheet_row: 3,
      first_seen: 0,
      updated_at: 0,
      clicks: 5,
      uniques: 5,
      bots: 0,
      previews: 2,
      last_click_at: null,
    },
    {
      slug: "old",
      destination: "https://example.org/",
      label: null,
      campaign: null,
      active: 1,
      in_sheet: 0,
      sheet_row: null,
      first_seen: 0,
      updated_at: 0,
      clicks: 0,
      uniques: 0,
      bots: 0,
      previews: 0,
      last_click_at: null,
    },
  ],
  sparkline: {
    since: "2026-09-04",
    rows: [{ slug: "s27", date: "2026-10-03", clicks: 12 }],
  },
  misses: [{ slug: "s72", clicks: 3 }],
};

/** One day of stats with a few breakdowns. */
export const STATS: StatsResponse = {
  from: "2026-10-02",
  to: "2026-10-03",
  slugs: null,
  series: [
    { date: "2026-10-03", clicks: 10, uniques: 8, bots: 2, previews: 3 },
  ],
  hours: [
    {
      date: "2026-10-03",
      hour: "15",
      clicks: 10,
      uniques: 8,
      bots: 2,
      previews: 3,
    },
  ],
  dims: {
    country: [{ value: "CO", clicks: 9, uniques: 7, bots: 1, previews: 3 }],
    device: [{ value: "mobile", clicks: 10, uniques: 8, bots: 0, previews: 0 }],
    preview_app: [
      { value: "", clicks: 10, uniques: 8, bots: 2, previews: 0 },
      { value: "whatsapp", clicks: 0, uniques: 0, bots: 0, previews: 3 },
    ],
  },
};

/** A sync that rejected one row. */
export const SYNC: SyncResponse = {
  state: {
    ran_at: Date.UTC(2026, 9, 3, 20, 29),
    ok: 1,
    rows: 3,
    changed: 0,
    errors: JSON.stringify([
      { row: 4, slug: "s 27", reason: "✗ slug inválido" },
    ]),
    message: null,
  },
  missing: [{ slug: "old", destination: "https://example.org/" }],
  statsUpdatedAt: Date.UTC(2026, 9, 3, 20, 27),
};
