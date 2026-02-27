import { resolve } from "node:path";
import { test, expect } from "@playwright/test";

test.describe("static build (file:// protocol)", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "tracking_consent_v1",
        JSON.stringify({
          version: 1,
          updatedAt: new Date().toISOString(),
          source: "accept_all",
          categories: {
            necessary: true,
            analytics: true,
            personalization: true,
            advertising: true,
          },
        })
      );
    });
  });

  test("hash route refresh keeps deep page and section query", async ({ page }) => {
    const htmlPath = resolve("dist-static/index.html");
    const baseFileUrl = `file:///${htmlPath.replaceAll("\\", "/")}`;

    await page.goto(`${baseFileUrl}#/registration-tutorial`, {
      waitUntil: "networkidle",
    });
    await expect(page).toHaveURL(/#\/registration-tutorial$/);
    await expect(page.getByRole("link", { name: /Back to landing|Volver al landing/i })).toBeVisible();

    await page.reload({ waitUntil: "networkidle" });
    await expect(page).toHaveURL(/#\/registration-tutorial$/);
    await expect(page.getByRole("link", { name: /Back to landing|Volver al landing/i })).toBeVisible();

    await page.goto(`${baseFileUrl}#/?section=registration`, {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(800);
    await expect(page).toHaveURL(/#\/\?section=registration$/);

    const registrationSection = page.locator("#registration");
    await page.waitForSelector("#registration", { timeout: 15000 });
    await expect(registrationSection).toBeVisible();

    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    await expect(page).toHaveURL(/#\/\?section=registration$/);
    await expect(registrationSection).toBeVisible();
  });

  test("opening tutorial from landing clears section query", async ({ page }) => {
    const htmlPath = resolve("dist-static/index.html");
    const baseFileUrl = `file:///${htmlPath.replaceAll("\\", "/")}`;

    await page.goto(`${baseFileUrl}#/?section=registration`, {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(800);

    const tutorialLink = page.getByRole("link", {
      name: /Open registration tutorial|Abrir tutorial de registro/i,
    });
    await tutorialLink.scrollIntoViewIfNeeded();
    await expect(tutorialLink).toBeVisible();
    await tutorialLink.click();

    await expect(page).toHaveURL(/#\/registration-tutorial$/);
    await expect(page).not.toHaveURL(/section=/);
  });

  test("opens directly from filesystem and renders all sections", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => {
      errors.push(err.message);
    });

    // Open the HTML file directly via file:// — like double-clicking it
    const htmlPath = resolve("dist-static/index.html");
    const fileUrl = `file:///${htmlPath.replaceAll("\\", "/")}`;
    console.log(`Opening: ${fileUrl}`);

    await page.goto(fileUrl, { waitUntil: "networkidle" });

    await page.screenshot({
      path: "e2e/screenshots/static-file-initial.png",
      fullPage: false,
    });

    // Check root has content
    const rootLength = await page.evaluate(
      () => document.getElementById("root")?.innerHTML.length ?? 0
    );
    console.log(`Root HTML length: ${rootLength}`);
    expect(rootLength).toBeGreaterThan(100);

    // Hero visible immediately
    const hero = page.locator("#hero");
    await expect(hero).toBeVisible({ timeout: 10000 });

    // Scroll through all sections
    const sections = [
      { id: "about" },
      { id: "events" },
      { id: "guests" },
      { id: "venue" },
      { id: "registration" },
      { id: "faq" },
    ];

    for (const { id } of sections) {
      const section = page.locator(`#${id}`);
      await section.scrollIntoViewIfNeeded();
      await page.waitForTimeout(800);

      const opacity = await section.evaluate(
        (el) => window.getComputedStyle(el).opacity
      );
      const heading = section.getByRole("heading").first();
      const headingVisible = await heading.isVisible();
      console.log(`#${id}: opacity=${opacity}, heading visible=${headingVisible}`);
      expect(Number(opacity)).toBeGreaterThan(0);
      expect(headingVisible).toBe(true);
    }

    // Full page screenshot
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    await page.screenshot({
      path: "e2e/screenshots/static-file-full.png",
      fullPage: true,
    });

    if (errors.length > 0) {
      console.log("JS errors:", errors);
    }
    expect(errors).toHaveLength(0);
  });
});
