import {
  readFileSync,
  readdirSync,
  writeFileSync,
  rmSync,
  existsSync,
} from "node:fs";
import { resolve, join } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const ASSET_EXTENSION_REGEX =
  /\.(png|jpe?g|gif|webp|svg|woff2?|ttf|otf|eot|mp4|webm)(\?|#|$)/i;
const URL_REGEX = /https?:\/\/[^\s"'()<>]+/gi;
const CONTENT_TYPE_BY_EXTENSION: Record<string, string> = {
  svg: "image/svg+xml",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  woff: "font/woff",
  woff2: "font/woff2",
  ttf: "font/ttf",
  otf: "font/otf",
  eot: "application/vnd.ms-fontobject",
  mp4: "video/mp4",
  webm: "video/webm",
};

function getExtension(url: string) {
  return url.split("?")[0]?.split(".").pop()?.toLowerCase();
}

function resolveContentType(url: string, mime?: string) {
  if (mime) {
    return mime;
  }
  const extension = getExtension(url);
  if (!extension) {
    return "application/octet-stream";
  }
  return CONTENT_TYPE_BY_EXTENSION[extension] ?? "application/octet-stream";
}

function toDataUrl(url: string, buffer: ArrayBuffer, mime?: string) {
  const contentType = resolveContentType(url, mime);

  if (contentType.includes("svg")) {
    const decoded = new TextDecoder().decode(buffer);
    const encoded = encodeURIComponent(decoded)
      .replace(/'/g, "%27")
      .replace(/"/g, "%22");
    return `data:${contentType};charset=utf-8,${encoded}`;
  }

  const base64 = Buffer.from(buffer).toString("base64");
  return `data:${contentType};base64,${base64}`;
}

function readAssetBundles(assetsDirectory: string) {
  const files = existsSync(assetsDirectory) ? readdirSync(assetsDirectory) : [];
  const cssFiles = files.filter((f) => f.endsWith(".css"));
  const jsFiles = files.filter((f) => f.endsWith(".js") && !f.endsWith(".map"));

  const cssContent = cssFiles
    .map((f) => readFileSync(join(assetsDirectory, f), "utf-8"))
    .join("\n");
  const jsContent = jsFiles
    .map((f) => readFileSync(join(assetsDirectory, f), "utf-8"))
    .join("\n");

  return { cssContent, jsContent };
}

async function inlineExternalUrls(input: string) {
  const matches = input.match(URL_REGEX);
  if (!matches) {
    return input;
  }

  const uniqueMatches = Array.from(new Set(matches)).filter((url) =>
    ASSET_EXTENSION_REGEX.test(url)
  );

  if (uniqueMatches.length === 0) {
    return input;
  }

  let output = input;

  for (const url of uniqueMatches) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        continue;
      }
      const buffer = await response.arrayBuffer();
      const contentType = response.headers.get("content-type") ?? undefined;
      const dataUrl = toDataUrl(url, buffer, contentType);
      output = output.replaceAll(url, dataUrl);
    } catch {
      // If fetch fails, keep original URL.
    }
  }

  return output;
}

async function inlineExternalStylesheets(html: string) {
  const linkRegex =
    /<link[^>]+rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi;
  const matches = Array.from(html.matchAll(linkRegex));
  if (matches.length === 0) {
    return html;
  }

  let output = html;
  for (const match of matches) {
    const href = match[1];
    if (!href?.startsWith("http")) {
      continue;
    }
    try {
      const response = await fetch(href);
      if (!response.ok) {
        continue;
      }
      let css = await response.text();
      css = await inlineExternalUrls(css);
      const styleTag = `<style>${css}</style>`;
      output = output.replace(match[0], styleTag);
    } catch {
      // Keep original link tag if fetch fails.
    }
  }

  return output;
}

function splitHtml(originalHtml: string) {
  const headEnd = originalHtml.indexOf("</head>");
  const bodyStart = originalHtml.indexOf("<body>");
  const bodyEnd = originalHtml.indexOf("</body>");

  const headContent = originalHtml
    .slice(0, headEnd)
    .replaceAll(/<link[^>]+href="\.\/assets\/[^"]+\.css"[^>]*\/?>/g, "")
    .replaceAll(/<script[^>]+src="\.\/assets\/[^"]+\.js"[^>]*><\/script>/g, "");

  const bodyContent = originalHtml.slice(bodyStart + "<body>".length, bodyEnd);

  return { headContent, bodyContent };
}

function buildInlinedHtml(
  headContent: string,
  cssContent: string,
  jsContent: string,
  bodyContent: string
) {
  return [
    headContent,
    `<style>${cssContent}</style>`,
    "</head>",
    "<body>",
    bodyContent,
    `<script type="module">${jsContent}</script>`,
    "</body></html>",
  ].join("\n");
}

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
    async writeBundle() {
      const assetsDirectory = resolve(outDirectory, "assets");
      const { cssContent, jsContent } = readAssetBundles(assetsDirectory);

      const htmlPath = resolve(outDirectory, "index.html");
      const originalHtml = readFileSync(htmlPath, "utf-8");
      const { headContent, bodyContent } = splitHtml(originalHtml);

      const headInlined = await inlineExternalStylesheets(headContent);
      const cssInlined = await inlineExternalUrls(cssContent);
      const jsInlined = await inlineExternalUrls(jsContent);
      const bodyInlined = await inlineExternalUrls(bodyContent);

      const inlinedHtml = buildInlinedHtml(
        headInlined,
        cssInlined,
        jsInlined,
        bodyInlined
      );

      writeFileSync(htmlPath, inlinedHtml);

      // Remove assets folder — everything is inlined
      if (existsSync(assetsDirectory)) {
        rmSync(assetsDirectory, { recursive: true, force: true });
      }
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
        assetsInlineLimit: Number.MAX_SAFE_INTEGER,
        rollupOptions: {
          output: {
            inlineDynamicImports: true,
          },
        },
      }),
    },
  };
});
