import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

/** Vitest config for the sunfest teaser (jsdom + @ alias). */
export default defineConfig({
  resolve: { alias: { "@": resolve(import.meta.dirname, "src") } },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
