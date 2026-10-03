import { describe, expect, it } from "vitest";
import { classifyAgent } from "./agents";
import {
  buildClick,
  primaryLanguage,
  recordClick,
  splitReferrer,
  visitorHash,
} from "./capture";
import { createTestDatabase } from "./test/d1";
import { GOOGLEBOT_UA, makeRequest, WHATSAPP_UA } from "./test/requests";
import { bogotaDayHour, isoWeek } from "./time";

/** 2026-10-03 20:30 UTC = 15:30 in Bogotá. */
const NOW = Date.UTC(2026, 9, 3, 20, 30);
const KEY = "test-visitor-key";

describe("buildClick", () => {
  it("records geo, network, device, language and UTM, never the IP", async () => {
    const row = await buildClick(
      makeRequest("https://fco.bz/s27?utm_source=ig&utm_campaign=launch", {
        referer: "https://www.instagram.com/p/abc?igsh=secret",
      }),
      { slug: "s27", miss: false, now: NOW, hashKey: KEY }
    );

    expect(row).toMatchObject({
      slug: "s27",
      day: "2026-10-03",
      hour: 15,
      country: "CO",
      region: "Bogota D.C.",
      city: "Bogotá",
      continent: "SA",
      lat: 4.609_71,
      lon: -74.081_75,
      colo: "BOG",
      asn: 10_620,
      as_org: "Telmex Colombia S.A.",
      device: "mobile",
      os: "Android",
      os_version: "14",
      browser: "Chrome",
      device_vendor: "Samsung",
      referrer_host: "instagram.com",
      referrer: "https://www.instagram.com/p/abc",
      lang: "es-CO",
      utm_source: "ig",
      utm_campaign: "launch",
      utm_medium: null,
      is_bot: 0,
      is_preview: 0,
      miss: 0,
    });
    expect(row.visitor_hash).toMatch(/^[0-9a-f]{32}$/);
    expect(Object.values(row)).not.toContain("203.0.113.7");
  });

  it("stores no visitor hash without a key", async () => {
    const row = await buildClick(makeRequest("https://fco.bz/s27"), {
      slug: "s27",
      miss: false,
      now: NOW,
      hashKey: undefined,
    });
    expect(row.visitor_hash).toBeNull();
  });

  it("flags previews with their app and bots as bots", async () => {
    const preview = await buildClick(
      makeRequest("https://fco.bz/s27", { "user-agent": WHATSAPP_UA }),
      { slug: "s27", miss: false, now: NOW, hashKey: KEY }
    );
    const bot = await buildClick(
      makeRequest("https://fco.bz/s27", { "user-agent": GOOGLEBOT_UA }),
      { slug: "s27", miss: false, now: NOW, hashKey: KEY }
    );
    expect(preview).toMatchObject({
      is_preview: 1,
      is_bot: 0,
      preview_app: "whatsapp",
    });
    expect(bot).toMatchObject({ is_preview: 0, is_bot: 1, device: "bot" });
  });
});

describe("classifyAgent", () => {
  it.each([
    ["TelegramBot (like TwitterBot)", "telegram"],
    [
      "Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)",
      "discord",
    ],
    [
      "facebookexternalhit/1.1 (+https://www.facebook.com/externalhit_uatext.php)",
      "facebook",
    ],
    ["facebookexternalhit/1.1 Facebot Twitterbot/1.0", "imessage"],
    ["Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)", "slack"],
  ])("%s → %s", (userAgent, app) => {
    expect(classifyAgent(userAgent)).toEqual({
      isBot: false,
      isPreview: true,
      previewApp: app,
    });
  });

  it.each(["curl/8.4.0", "python-requests/2.31", "", "UptimeRobot/2.0"])(
    "treats %j as a bot",
    (userAgent) => {
      expect(classifyAgent(userAgent).isBot).toBe(true);
    }
  );

  it("does not flag a CUBOT phone as a bot", () => {
    expect(
      classifyAgent(
        "Mozilla/5.0 (Linux; Android 12; CUBOT X50) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36"
      ).isBot
    ).toBe(false);
  });
});

describe("visitorHash", () => {
  it("is stable within a day and rotates across days", async () => {
    const monday = await visitorHash(KEY, "2026-10-05", "198.51.100.1", "ua");
    const mondayAgain = await visitorHash(
      KEY,
      "2026-10-05",
      "198.51.100.1",
      "ua"
    );
    const tuesday = await visitorHash(KEY, "2026-10-06", "198.51.100.1", "ua");
    expect(mondayAgain).toBe(monday);
    expect(tuesday).not.toBe(monday);
  });

  it("differs per visitor", async () => {
    const one = await visitorHash(KEY, "2026-10-05", "198.51.100.1", "ua");
    const two = await visitorHash(KEY, "2026-10-05", "198.51.100.2", "ua");
    expect(one).not.toBe(two);
  });
});

describe("header helpers", () => {
  it("normalises the primary language", () => {
    expect(primaryLanguage("es-co,es;q=0.9")).toBe("es-CO");
    expect(primaryLanguage("EN")).toBe("en");
    expect(primaryLanguage("*")).toBeNull();
    expect(primaryLanguage(null)).toBeNull();
  });

  it("drops the referrer query and www", () => {
    expect(splitReferrer("https://www.t.me/channel/5?x=1")).toEqual({
      host: "t.me",
      referrer: "https://www.t.me/channel/5",
    });
    expect(splitReferrer("not a url")).toEqual({ host: null, referrer: null });
  });
});

describe("time helpers", () => {
  it("buckets by Bogotá day and hour", () => {
    expect(bogotaDayHour(Date.UTC(2026, 9, 4, 3, 0))).toEqual({
      day: "2026-10-03",
      hour: 22,
    });
  });

  it("labels ISO weeks", () => {
    expect(isoWeek("2026-10-05")).toBe("2026-W41");
    expect(isoWeek("2027-01-01")).toBe("2026-W53");
  });
});

describe("recordClick", () => {
  it("marks only a visitor's first human click per slug and day", async () => {
    const { database, raw } = createTestDatabase();
    const options = { slug: "s27", miss: false, now: NOW, hashKey: KEY };
    const request = () => makeRequest("https://fco.bz/s27");

    await recordClick(database, await buildClick(request(), options));
    await recordClick(database, await buildClick(request(), options));
    await recordClick(
      database,
      await buildClick(request(), { ...options, slug: "s27t" })
    );
    await recordClick(
      database,
      await buildClick(request(), { ...options, now: NOW + 86_400_000 })
    );
    await recordClick(
      database,
      await buildClick(
        makeRequest("https://fco.bz/s27", { "user-agent": GOOGLEBOT_UA }),
        options
      )
    );

    const rows = raw
      .prepare("SELECT slug, day, human, is_first FROM clicks ORDER BY id")
      .all();
    expect(rows).toEqual([
      { slug: "s27", day: "2026-10-03", human: 1, is_first: 1 },
      { slug: "s27", day: "2026-10-03", human: 1, is_first: 0 },
      { slug: "s27t", day: "2026-10-03", human: 1, is_first: 1 },
      { slug: "s27", day: "2026-10-04", human: 1, is_first: 1 },
      { slug: "s27", day: "2026-10-03", human: 0, is_first: 0 },
    ]);
  });

  it("never marks misses as human", async () => {
    const { database, raw } = createTestDatabase();
    await recordClick(
      database,
      await buildClick(makeRequest("https://fco.bz/nope"), {
        slug: "nope",
        miss: true,
        now: NOW,
        hashKey: KEY,
      })
    );
    expect(
      raw.prepare("SELECT human, is_first, miss FROM clicks").get()
    ).toEqual({
      human: 0,
      is_first: 0,
      miss: 1,
    });
  });
});
