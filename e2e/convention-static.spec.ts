import { resolve } from "node:path";
import { test, expect } from "@playwright/test";

test.describe("static build (file:// protocol)", () => {
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
      { id: "about", text: "About Eclipse Con" },
      { id: "events", text: "Events" },
      { id: "guests", text: "Featured Guests" },
      { id: "venue", text: "The Venue" },
      { id: "registration", text: "Registration" },
      { id: "faq", text: "Frequently Asked" },
    ];

    for (const { id, text } of sections) {
      const section = page.locator(`#${id}`);
      await section.scrollIntoViewIfNeeded();
      await page.waitForTimeout(800);

      const opacity = await section.evaluate(
        (el) => window.getComputedStyle(el).opacity
      );
      const textVisible = await section
        .getByText(text, { exact: false })
        .isVisible();
      console.log(`#${id}: opacity=${opacity}, text visible=${textVisible}`);
      expect(Number(opacity)).toBeGreaterThan(0);
      expect(textVisible).toBe(true);
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
