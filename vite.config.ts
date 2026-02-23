import { readFileSync, readdirSync, writeFileSync, rmSync } from "node:fs";
import { resolve, join } from "node:path";
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

function inlineAssetsPlugin(outDirectory: string): Plugin {
  return {
    name: "inline-assets",
    apply: "build",
    enforce: "post",
    writeBundle() {
      const assetsDirectory = resolve(outDirectory, "assets");
      const files = readdirSync(assetsDirectory);

      // Read all asset contents
      const cssFiles = files.filter((f) => f.endsWith(".css"));
      const jsFiles = files.filter(
        (f) => f.endsWith(".js") && !f.endsWith(".map")
      );

      const cssContent = cssFiles
        .map((f) => readFileSync(join(assetsDirectory, f), "utf-8"))
        .join("\n");
      const jsContent = jsFiles
        .map((f) => readFileSync(join(assetsDirectory, f), "utf-8"))
        .join("\n");

      // Build new HTML from scratch (avoids String.replace $ pattern issues)
      const htmlPath = resolve(outDirectory, "index.html");
      const originalHtml = readFileSync(htmlPath, "utf-8");

      // Extract everything before </head> and after <body>
      const headEnd = originalHtml.indexOf("</head>");
      const bodyStart = originalHtml.indexOf("<body>");
      const bodyEnd = originalHtml.indexOf("</body>");

      const headContent = originalHtml
        .slice(0, headEnd)
        // Remove external CSS links
        .replaceAll(/<link[^>]+href="\.\/assets\/[^"]+\.css"[^>]*\/?>/g, "")
        // Remove external JS scripts
        .replaceAll(
          /<script[^>]+src="\.\/assets\/[^"]+\.js"[^>]*><\/script>/g,
          ""
        );

      const bodyContent = originalHtml.slice(
        bodyStart + "<body>".length,
        bodyEnd
      );

      const inlinedHtml = [
        headContent,
        `<style>${cssContent}</style>`,
        "</head>",
        "<body>",
        bodyContent,
        `<script type="module">${jsContent}</script>`,
        "</body></html>",
      ].join("\n");

      writeFileSync(htmlPath, inlinedHtml);

      // Remove assets folder — everything is inlined
      rmSync(assetsDirectory, { recursive: true, force: true });
    },
  };
}

export default defineConfig(({ mode }) => {
  const isStatic = mode === "static";
  const outDirectory = isStatic ? "dist-static" : "dist";

  return {
    base: isStatic ? "./" : "/",
    plugins: [
      react(),
      tailwindcss(),
      ...(isStatic
        ? [
            staticBuildPlugin(),
            inlineAssetsPlugin(resolve(import.meta.dirname, outDirectory)),
          ]
        : []),
    ],
    resolve: {
      alias: {
        "@": resolve(import.meta.dirname, "src"),
      },
    },
    build: {
      outDir: outDirectory,
      sourcemap: !isStatic,
      ...(isStatic && {
        rollupOptions: {
          output: {
            inlineDynamicImports: true,
          },
        },
      }),
    },
  };
});
