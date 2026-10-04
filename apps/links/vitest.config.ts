import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

/**
 * Two test projects: the Worker runs in plain Node (WebCrypto, `node:sqlite`
 * standing in for D1), the dashboard in jsdom with the i18n key mock.
 */
export default defineConfig({
  resolve: { alias: { "@": resolve(import.meta.dirname, "src") } },
  test: {
    globals: true,
    projects: [
      {
        extends: true,
        test: {
          name: "worker",
          environment: "node",
          include: ["worker/**/*.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "dashboard",
          environment: "jsdom",
          setupFiles: ["./src/test-setup.ts"],
          include: ["src/**/*.test.{ts,tsx}"],
        },
      },
    ],
  },
});
