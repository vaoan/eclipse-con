import { expect, test, type Page } from "@playwright/test";

const CONSENT_KEY = "tracking_consent_v1";

async function dismissConsentGate(page: Page) {
  const rejectButton = page.locator('[data-cta-id="consent_reject"]');
  if (await rejectButton.isVisible().catch(() => false)) {
    await rejectButton.click();
  }
}

async function expectSectionNearTop(page: Page, testId: string) {
  const section = page.getByTestId(testId);
  await expect(section).toBeVisible();
  await expect
    .poll(
      async () => (await section.boundingBox())?.y ?? Number.POSITIVE_INFINITY
    )
    .toBeLessThan(180);
}

test.describe("browser routing", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript((key) => {
      window.localStorage.setItem(
        key,
        JSON.stringify({
          version: 2,
          updatedAt: new Date().toISOString(),
          source: "reject_optional",
          categories: {
            necessary: true,
            analytics: false,
            personalization: false,
            advertising: false,
          },
        })
      );
    }, CONSENT_KEY);
  });

  test("browser back from the registration tutorial CTA returns to registration", async ({
    page,
  }) => {
    await page.goto("/?section=registration", {
      waitUntil: "domcontentloaded",
    });
    await dismissConsentGate(page);
    await expect(page).toHaveURL(/\/\?section=registration$/);
    await expectSectionNearTop(page, "section-registration");

    await page.getByTestId("registration-tutorial-link").click();
    await expect(page).toHaveURL(/\/registration-tutorial\?step=1$/);
    await expect(page.getByTestId("registration-tutorial-page")).toBeVisible();

    await page.goBack({ waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/\?section=registration$/);
    await expectSectionNearTop(page, "section-registration");
  });

  test("browser back from the FAQ tutorial CTA returns to FAQ", async ({
    page,
  }) => {
    await page.goto("/?section=faq", { waitUntil: "domcontentloaded" });
    await dismissConsentGate(page);
    await expect(page).toHaveURL(/\/\?section=faq$/);
    await expectSectionNearTop(page, "section-faq");

    await page.getByTestId("faq-registration-tutorial-link").click();
    await expect(page).toHaveURL(/\/registration-tutorial\?step=1$/);
    await expect(page.getByTestId("registration-tutorial-page")).toBeVisible();

    await page.goBack({ waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/\?section=faq$/);
    await expectSectionNearTop(page, "section-faq");
  });

  test("tutorial back button always goes to registration", async ({ page }) => {
    await page.goto("/?section=faq", { waitUntil: "domcontentloaded" });
    await dismissConsentGate(page);

    await page.getByTestId("faq-registration-tutorial-link").click();
    await expect(page).toHaveURL(/\/registration-tutorial\?step=1$/);

    await page.getByTestId("tutorial-back-to-registration").click();
    await expect(page).toHaveURL(/\/\?section=registration$/);
    await expectSectionNearTop(page, "section-registration");
  });
});
