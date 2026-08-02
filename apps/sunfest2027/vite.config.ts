import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

/**
 * Vite config for the sunfest teaser: React + Tailwind v4.
 *
 * The deployed build emits ordinary separate assets. Inlining everything into
 * one HTML costs ~33% in base64 overhead and, worse, makes the browser download
 * every below-the-fold photo before it can paint anything. Cloudflare serves the
 * separate files from Static Assets, so they cache individually and the showcase
 * photos can load lazily.
 *
 * `--mode singlefile` (see the `build:static` script) still produces the
 * one-file artifact for the network share, where portability is the point.
 */
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    ...(mode === "singlefile" ? [viteSingleFile()] : []),
  ],
  resolve: { alias: { "@": resolve(import.meta.dirname, "src") } },
}));
