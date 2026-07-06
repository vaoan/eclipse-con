import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: /analytics\.spec\.ts/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:4173",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command:
      "powershell -NoProfile -Command \"$env:VITE_ANALYTICS_ENABLED='true'; $env:VITE_GA_MEASUREMENT_ENABLED='true'; $env:VITE_GA_MEASUREMENT_ID='G-TEST123456'; $env:VITE_GTM_ENABLED='true'; $env:VITE_GTM_CONTAINER_ID='GTM-TEST123'; pnpm dev --host 127.0.0.1 --port 4173\"",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
  },
});
