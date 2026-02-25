import { test, expect } from "@playwright/test";

test("convention page loads all sections with content visible after scroll", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Moonfest 2026");

  // Hero should be visible immediately (no scroll-reveal)
  const hero = page.getByTestId("section-hero");
  await expect(hero).toBeVisible({ timeout: 10000 });
  await page.screenshot({
    path: "e2e/screenshots/01-hero.png",
    fullPage: false,
  });

  // Scroll to each section and check visibility
  const sections = [
    { id: "section-about" },
    { id: "section-events" },
    { id: "section-guests" },
    { id: "section-venue" },
    { id: "section-registration" },
    { id: "section-faq" },
  ];

  for (const { id } of sections) {
    const section = page.getByTestId(id);
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);

    const heading = section.getByRole("heading").first();
    await expect(heading).toBeVisible();
    console.log(`${id}: heading visible`);

    await page.screenshot({
      path: `e2e/screenshots/${id}.png`,
      fullPage: false,
    });

  }

  // Footer check separately (uses heading role to avoid ambiguity)
  const footer = page.getByTestId("section-footer");
  await footer.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  const footerHeading = footer.getByRole("heading", { name: "Moonfest 2026" });
  await expect(footerHeading).toBeVisible();
  await page.screenshot({
    path: "e2e/screenshots/section-footer.png",
    fullPage: false,
  });

  // Full page screenshot (scroll all the way down first so reveals trigger)
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await page.screenshot({
    path: "e2e/screenshots/full-page.png",
    fullPage: true,
  });
});
