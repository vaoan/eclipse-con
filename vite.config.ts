import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

function staticBuildPlugin(): Plugin {
  return {
    name: "static-build",
    apply: "build",
    transform(code, id) {
      if (id.endsWith("router.tsx")) {
        return {
          code: code.replaceAll("createBrowserRouter", "createHashRouter"),
          map: null,
        };
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const isStatic = mode === "static";

  return {
    base: isStatic ? "./" : "/",
    plugins: [
      react(),
      tailwindcss(),
      ...(isStatic ? [staticBuildPlugin()] : []),
    ],
    resolve: {
      alias: {
        "@": resolve(import.meta.dirname, "src"),
      },
    },
    build: {
      outDir: isStatic ? "dist-static" : "dist",
      sourcemap: true,
    },
  };
});
