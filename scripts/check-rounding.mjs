import { spawn } from "node:child_process";
import { chromium } from "playwright";

const previewPort = "4173";
const preview = spawn("pnpm", ["preview", "--", "--port", previewPort], {
  stdio: "inherit",
  shell: true,
});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const cleanup = () => {
  if (!preview.killed) {
    preview.kill("SIGTERM");
  }
};

const run = async () => {
  await wait(5000);
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(`http://localhost:${previewPort}`, {
    waitUntil: "networkidle",
  });

  const samples = await page.evaluate(() => {
    const card = document.querySelector('[data-slot="card"]');
    const button = document.querySelector('[data-slot="button"]');
    const getRadius = (el) =>
      el ? window.getComputedStyle(el).borderRadius : "missing";
    return {
      cardRadius: getRadius(card),
      buttonRadius: getRadius(button),
    };
  });

  console.log("[rounding] cardRadius:", samples.cardRadius);
  console.log("[rounding] buttonRadius:", samples.buttonRadius);

  await page.screenshot({
    path: "e2e/screenshots/rounding-check.png",
    fullPage: false,
  });
  await browser.close();
};

run()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => {
    cleanup();
  });
