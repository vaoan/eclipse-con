import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/**
 * Vite config for the admin.fco.bz dashboard: React + Tailwind v4.
 *
 * In dev, `/api` is proxied to `wrangler dev` (port 8787), which serves the
 * Worker with a local D1 and the localhost-only Access bypass.
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": resolve(import.meta.dirname, "src") } },
  server: { proxy: { "/api": "http://localhost:8787" } },
});
