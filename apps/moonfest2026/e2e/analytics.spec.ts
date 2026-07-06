import { expect, test } from "@playwright/test";

test.describe("analytics instrumentation", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("https://www.googletagmanager.com/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/javascript",
        body: "",
      });
    });
  });

  test("accepted consent boots GA/GTM and mirrors key events into dataLayer", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    await expect(page).toHaveTitle("moonfest 2026");
    await page.locator('[data-cta-id="consent_accept_all"]').click();
    await page.reload({ waitUntil: "networkidle" });

    const heroCta = page.locator('[data-cta-id="hero_primary_cta"]').first();
    await expect(heroCta).toBeVisible();
    await heroCta.click();

    const dataLayerEvents = await page.evaluate(() => {
      return (window.dataLayer ?? [])
        .filter(
          (entry): entry is Record<string, unknown> =>
            !!entry && typeof entry === "object"
        )
        .map((entry) => ({
          event: typeof entry.event === "string" ? entry.event : null,
          ctaId: typeof entry.ctaId === "string" ? entry.ctaId : null,
          path: typeof entry.page_path === "string" ? entry.page_path : null,
          locale: typeof entry.locale === "string" ? entry.locale : null,
        }));
    });

    expect(dataLayerEvents.some((entry) => entry.event === "gtm.js")).toBe(
      true
    );
    expect(
      dataLayerEvents.some((entry) => entry.event === "session_start")
    ).toBe(true);
    expect(dataLayerEvents.some((entry) => entry.event === "page_view")).toBe(
      true
    );
    expect(
      dataLayerEvents.some(
        (entry) =>
          entry.event === "cta_interaction" &&
          entry.ctaId === "hero_primary_cta"
      )
    ).toBe(true);
    expect(
      dataLayerEvents.some(
        (entry) => entry.event === "page_view" && entry.path === "/"
      )
    ).toBe(true);
  });

  test("rejected optional consent prevents analytics events from entering dataLayer", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.locator('[data-cta-id="consent_reject"]').click();

    const heroCta = page.locator('[data-cta-id="hero_primary_cta"]').first();
    await expect(heroCta).toBeVisible();
    await heroCta.click();

    const eventNames = await page.evaluate(() => {
      return (window.dataLayer ?? [])
        .filter(
          (entry): entry is Record<string, unknown> =>
            !!entry && typeof entry === "object"
        )
        .map((entry) => (typeof entry.event === "string" ? entry.event : null))
        .filter((entry): entry is string => entry !== null);
    });

    expect(eventNames).toContain("gtm.js");
    expect(eventNames).not.toContain("session_start");
    expect(eventNames).not.toContain("page_view");
    expect(eventNames).not.toContain("cta_interaction");
  });

  test("accepted consent tracks reservation handoff from the registration CTA", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    await page.locator('[data-cta-id="consent_accept_all"]').click();
    await page.reload({ waitUntil: "networkidle" });

    const reserveCta = page.locator('[data-cta-id="registration_reserve"]');
    await expect(reserveCta).toBeVisible();
    await reserveCta.click();

    const dataLayerEvents = await page.evaluate(() => {
      return (window.dataLayer ?? [])
        .filter(
          (entry): entry is Record<string, unknown> =>
            !!entry && typeof entry === "object"
        )
        .map((entry) => ({
          event: typeof entry.event === "string" ? entry.event : null,
          ctaId: typeof entry.ctaId === "string" ? entry.ctaId : null,
          step: typeof entry.step === "string" ? entry.step : null,
          sourceSurface:
            typeof entry.sourceSurface === "string"
              ? entry.sourceSurface
              : null,
          targetAction:
            typeof entry.targetAction === "string" ? entry.targetAction : null,
        }));
    });

    expect(
      dataLayerEvents.some(
        (entry) =>
          entry.event === "cta_interaction" &&
          entry.ctaId === "registration_reserve"
      )
    ).toBe(true);
    expect(
      dataLayerEvents.some(
        (entry) =>
          entry.event === "funnel_step" && entry.step === "click_reserve"
      )
    ).toBe(true);
    expect(
      dataLayerEvents.some(
        (entry) =>
          entry.event === "reserve_ticket_handoff" &&
          entry.sourceSurface === "registration" &&
          entry.targetAction === "reserve"
      )
    ).toBe(true);
  });
});
