/* eslint-disable max-lines, no-console */
import {
  readFileSync,
  readdirSync,
  writeFileSync,
  rmSync,
  existsSync,
} from "node:fs";
import { resolve, join, isAbsolute } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import type { Sharp } from "sharp";

/* eslint-disable sonarjs/slow-regex, sonarjs/regex-complexity */
const ASSET_EXTENSION_REGEX =
  /\.(png|jpe?g|gif|webp|svg|woff2?|ttf|otf|eot|mp4|webm)(\?|#|$)/i;
const URL_REGEX = /https?:\/\/[^\s"'()<>]+/gi;
const LOCAL_ASSET_URL_REGEX =
  /(?:\.\/|\/)[^\s"'()<>]+\.(?:png|jpe?g|gif|webp|svg|woff2?|ttf|otf|eot|mp4|webm)(?:\?[^\s"'()<>]*)?(?:#[^\s"'()<>]*)?/gi;
/* eslint-enable sonarjs/slow-regex, sonarjs/regex-complexity */
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
const KNOWN_IMAGE_CDN_REGEX =
  /(cdn\.simpleicons\.org|images?|img|media|assets?|cloudinary|unsplash|pexels)/i;
const STATIC_MEDIA_CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

let sharpPromise: Promise<unknown> | null = null;
type SharpFactory = (input: Uint8Array) => Sharp;

async function loadSharp(): Promise<SharpFactory | null> {
  sharpPromise ??= import("sharp").catch(() => null);
  const module = await sharpPromise;
  if (!module) {
    return null;
  }
  const sharp =
    (module as { default?: unknown }).default ?? (module as unknown);
  return typeof sharp === "function" ? (sharp as SharpFactory) : null;
}

function isRasterImage(contentType: string | undefined, url: string) {
  if (contentType?.startsWith("image/")) {
    return !contentType.includes("svg") && !contentType.includes("gif");
  }
  const extension = getExtension(url);
  return extension ? ["jpg", "jpeg", "png", "webp"].includes(extension) : false;
}

async function optimizeImageBuffer(
  url: string,
  buffer: Uint8Array,
  contentType?: string
) {
  if (!isRasterImage(contentType, url)) {
    return buffer;
  }
  const sharpFactory = await loadSharp();
  if (!sharpFactory) {
    return buffer;
  }
  try {
    const image = sharpFactory(buffer);
    const metadata = await image.metadata();
    let pipeline = image;
    const maxWidth = 2000;
    if (metadata.width && metadata.width > maxWidth) {
      pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true });
    }
    const extension = getExtension(url);
    if (extension === "jpg" || extension === "jpeg") {
      pipeline = pipeline.jpeg({ quality: 78, mozjpeg: true });
    } else if (extension === "png") {
      pipeline = pipeline.png({ compressionLevel: 9, palette: true });
    } else if (extension === "webp") {
      pipeline = pipeline.webp({ quality: 78 });
    }
    const output = await pipeline.toBuffer();
    return output.length < buffer.length ? output : buffer;
  } catch {
    return buffer;
  }
}

type ProgressReporter = (
  phase: string,
  current: number,
  total: number,
  detail?: string
) => void;

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

function toProgressBar(current: number, total: number, width = 24) {
  if (total <= 0) {
    return "[]";
  }
  const ratio = Math.min(1, Math.max(0, current / total));
  const filled = Math.round(ratio * width);
  return `[${"#".repeat(filled)}${"-".repeat(width - filled)}]`;
}

function logProgress(
  phase: string,
  current: number,
  total: number,
  detail?: string
) {
  const bar = toProgressBar(current, total);
  const suffix = detail ? ` - ${detail}` : "";
  console.log(`[static] ${phase} ${bar} ${current}/${total}${suffix}`);
}

function isLikelyAssetCandidate(url: string) {
  return (
    ASSET_EXTENSION_REGEX.test(url) ||
    KNOWN_IMAGE_CDN_REGEX.test(url) ||
    url.includes("viewbox=auto")
  );
}

function toDataUrl(
  url: string,
  buffer: ArrayBuffer | Uint8Array,
  mime?: string
) {
  const contentType = resolveContentType(url, mime);
  const bytes = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : buffer;

  if (contentType.includes("svg")) {
    const decoded = new TextDecoder().decode(bytes);
    const encoded = encodeURIComponent(decoded)
      .replace(/'/g, "%27")
      .replace(/"/g, "%22");
    return `data:${contentType};charset=utf-8,${encoded}`;
  }

  const base64 = Buffer.from(bytes).toString("base64");
  return `data:${contentType};base64,${base64}`;
}

function stripQueryAndHash(url: string) {
  return url.split("#")[0]?.split("?")[0] ?? url;
}

function resolveLocalAssetPath(outDirectory: string, url: string) {
  const cleanUrl = stripQueryAndHash(url);
  if (cleanUrl.startsWith("./")) {
    return resolve(outDirectory, cleanUrl.slice(2));
  }
  if (cleanUrl.startsWith("/")) {
    return resolve(outDirectory, cleanUrl.slice(1));
  }
  return null;
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

async function inlineExternalUrls(
  input: string,
  phase = "Inline External URLs",
  reportProgress: ProgressReporter = logProgress
) {
  const matches: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = URL_REGEX.exec(input)) !== null) {
    matches.push(match[0]);
  }
  URL_REGEX.lastIndex = 0;
  if (matches.length === 0) {
    reportProgress(phase, 1, 1, "No external URLs found");
    return input;
  }

  const uniqueMatches = Array.from(new Set(matches)).filter(
    isLikelyAssetCandidate
  );

  if (uniqueMatches.length === 0) {
    reportProgress(phase, 1, 1, "No asset-like URLs to inline");
    return input;
  }

  let output = input;
  let current = 0;
  reportProgress(phase, current, uniqueMatches.length, "Starting");

  for (const url of uniqueMatches) {
    current += 1;
    const extension = getExtension(url);
    if (extension === "css") {
      reportProgress(
        phase,
        current,
        uniqueMatches.length,
        `Skipped (non-asset): ${url}`
      );
      continue;
    }
    try {
      const response = await fetch(url);
      if (!response.ok) {
        reportProgress(
          phase,
          current,
          uniqueMatches.length,
          `Skipped (${response.status}): ${url}`
        );
        continue;
      }
      const contentType = response.headers.get("content-type") ?? undefined;
      const isImageByContentType = contentType?.startsWith("image/") ?? false;
      const shouldInline =
        ASSET_EXTENSION_REGEX.test(url) || isImageByContentType;
      if (!shouldInline) {
        reportProgress(
          phase,
          current,
          uniqueMatches.length,
          `Keep link: ${url}`
        );
        continue;
      }
      const buffer = new Uint8Array(await response.arrayBuffer());
      const optimized = await optimizeImageBuffer(url, buffer, contentType);
      const dataUrl = toDataUrl(url, optimized, contentType);
      output = output.replaceAll(url, dataUrl);
      reportProgress(phase, current, uniqueMatches.length, `Inlined: ${url}`);
    } catch {
      // If fetch fails, keep original URL.
      reportProgress(phase, current, uniqueMatches.length, `Failed: ${url}`);
    }
  }

  return output;
}

async function inlineCssUrlReferences(
  css: string,
  phase = "Inline CSS url(...)",
  reportProgress: ProgressReporter = logProgress
) {
  const cssUrlRegex = /url\((['"]?)(https?:\/\/[^"')]+)\1\)/gi;
  const matches = Array.from(css.matchAll(cssUrlRegex))
    .map((m) => m[2])
    .filter((url): url is string => Boolean(url));
  if (matches.length === 0) {
    reportProgress(phase, 1, 1, "No CSS URL references found");
    return css;
  }

  const uniqueMatches = Array.from(new Set(matches));
  let output = css;
  let current = 0;
  reportProgress(phase, current, uniqueMatches.length, "Starting");

  for (const url of uniqueMatches) {
    current += 1;
    const extension = getExtension(url);
    if (extension === "css") {
      reportProgress(
        phase,
        current,
        uniqueMatches.length,
        `Skipped (non-asset): ${url}`
      );
      continue;
    }
    try {
      const response = await fetch(url);
      if (!response.ok) {
        reportProgress(
          phase,
          current,
          uniqueMatches.length,
          `Skipped (${response.status}): ${url}`
        );
        continue;
      }
      const buffer = new Uint8Array(await response.arrayBuffer());
      const contentType = response.headers.get("content-type") ?? undefined;
      const optimized = await optimizeImageBuffer(url, buffer, contentType);
      const dataUrl = toDataUrl(url, optimized, contentType);
      output = output.replaceAll(url, dataUrl);
      reportProgress(phase, current, uniqueMatches.length, `Inlined: ${url}`);
    } catch {
      // If fetch fails, keep original URL.
      reportProgress(phase, current, uniqueMatches.length, `Failed: ${url}`);
    }
  }

  return output;
}

async function inlineLocalUrls(input: string, outDirectory: string) {
  const matches = input.match(LOCAL_ASSET_URL_REGEX);
  if (!matches) {
    return input;
  }

  const uniqueMatches = Array.from(new Set(matches)).filter(
    (url) => !url.startsWith("//")
  );
  if (uniqueMatches.length === 0) {
    return input;
  }

  let output = input;
  for (const url of uniqueMatches) {
    const localPath = resolveLocalAssetPath(outDirectory, url);
    if (!localPath || !existsSync(localPath)) {
      continue;
    }
    try {
      const buffer = readFileSync(localPath);
      const optimized = await optimizeImageBuffer(url, buffer);
      const dataUrl = toDataUrl(url, optimized);
      output = output.replaceAll(url, dataUrl);
    } catch {
      // If local read fails, keep original URL.
    }
  }

  return output;
}

async function inlineExternalStylesheets(html: string) {
  const linkTagRegex = /<link\b[^>]*>/gi;
  const linkTags = Array.from(html.matchAll(linkTagRegex)).map((m) => m[0]);
  if (linkTags.length === 0) {
    logProgress("Inline External Stylesheets", 1, 1, "No <link> tags found");
    return html;
  }

  let output = html;
  let processed = 0;
  const totalStylesheets = linkTags.filter((tag) =>
    /rel=["']stylesheet["']/i.test(tag)
  ).length;
  if (totalStylesheets === 0) {
    logProgress(
      "Inline External Stylesheets",
      1,
      1,
      "No external stylesheets found"
    );
    return html;
  }
  logProgress("Inline External Stylesheets", 0, totalStylesheets, "Starting");
  for (const tag of linkTags) {
    const isStylesheet = /rel=["']stylesheet["']/i.test(tag);
    if (!isStylesheet) {
      continue;
    }
    processed += 1;
    const hrefMatch = /href=["']([^"']+)["']/i.exec(tag);
    const href = hrefMatch?.[1];
    if (!href?.startsWith("http")) {
      logProgress(
        "Inline External Stylesheets",
        processed,
        totalStylesheets,
        "Skipped local stylesheet"
      );
      continue;
    }
    try {
      const response = await fetch(href);
      if (!response.ok) {
        logProgress(
          "Inline External Stylesheets",
          processed,
          totalStylesheets,
          `Skipped (${response.status}): ${href}`
        );
        continue;
      }
      let css = await response.text();
      // Strip Adobe Typekit analytics @import (p.typekit.net) — avoids a
      // console error when the tracking request is blocked (ERR_NAME_NOT_RESOLVED).
      css = css.replace(
        /@import\s+url\(['"]?https?:\/\/p\.typekit\.net[^)'"]*['"]?\)[^;]*;?\n?/gi,
        ""
      );
      css = await inlineCssUrlReferences(
        css,
        `Inline CSS url(...) for ${href}`,
        logProgress
      );
      css = await inlineExternalUrls(
        css,
        `Inline external URLs in stylesheet ${href}`,
        logProgress
      );
      const styleTag = `<style>${css}</style>`;
      output = output.replace(tag, styleTag);
      logProgress(
        "Inline External Stylesheets",
        processed,
        totalStylesheets,
        `Inlined: ${href}`
      );
    } catch {
      // Keep original link tag if fetch fails.
      logProgress(
        "Inline External Stylesheets",
        processed,
        totalStylesheets,
        `Failed: ${href}`
      );
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

function protectSocialPreviewMetaUrls(html: string) {
  const replacements = new Map<string, string>();
  let counter = 0;
  const pattern =
    /<meta[^>]+(?:property=["']og:image["']|name=["']twitter:image["'])[^>]+content=["']([^"']+)["'][^>]*>/gi;

  const protectedHtml = html.replaceAll(pattern, (fullMatch, url: string) => {
    if (!url) {
      return fullMatch;
    }
    const token = `__SOCIAL_META_URL_${counter++}__`;
    replacements.set(token, url);
    return fullMatch.replace(url, token);
  });

  return { protectedHtml, replacements };
}

function restoreSocialPreviewMetaUrls(
  html: string,
  replacements: Map<string, string>
) {
  let output = html;
  for (const [token, url] of replacements.entries()) {
    output = output.replaceAll(token, url);
  }
  return output;
}

function deduplicateDataUrisInJs(js: string): string {
  // Find all quoted data URIs (double or single quoted) that are at least 512 chars
  const dataUriRegex = /"(data:[^"]{512,})"|'(data:[^']{512,})'/g;
  const counts = new Map<string, number>();
  let m: RegExpExecArray | null;
  while ((m = dataUriRegex.exec(js)) !== null) {
    const uri = m[1] ?? m[2];
    if (uri) {
      counts.set(uri, (counts.get(uri) ?? 0) + 1);
    }
  }
  dataUriRegex.lastIndex = 0;

  const duplicates = Array.from(counts.entries())
    .filter(([, n]) => n > 1)
    .sort(([a], [b]) => b.length - a.length);

  if (duplicates.length === 0) {
    console.log("[static] Dedup: no duplicate data URIs in JS bundle");
    return js;
  }

  const declarations: string[] = [];
  let out = js;
  let totalSaved = 0;
  duplicates.forEach(([uri, count], index) => {
    const variableName = `__INLINED_ASSET_${index}__`;
    declarations.push(`var ${variableName}=${JSON.stringify(uri)};`);
    out = out
      .replaceAll(`"${uri}"`, variableName)
      .replaceAll(`'${uri}'`, variableName);
    totalSaved += (count - 1) * uri.length;
  });

  console.log(
    `[static] Dedup: extracted ${duplicates.length} duplicate data URI(s), saved ~${(totalSaved / 1024).toFixed(1)} KB`
  );
  return `${declarations.join("")}${out}`;
}

function deduplicateDataUrisInCss(css: string): string {
  // Matches quoted data URIs inside url("...") or url('...') that are ≥512 chars
  const dataUriRegex = /url\("(data:[^"]{512,})"\)|url\('(data:[^']{512,})'\)/g;
  const counts = new Map<string, number>();
  let m: RegExpExecArray | null;
  while ((m = dataUriRegex.exec(css)) !== null) {
    const uri = m[1] ?? m[2];
    if (uri) {
      counts.set(uri, (counts.get(uri) ?? 0) + 1);
    }
  }
  dataUriRegex.lastIndex = 0;

  const duplicates = Array.from(counts.entries())
    .filter(([, n]) => n > 1)
    .sort(([a], [b]) => b.length - a.length);

  if (duplicates.length === 0) {
    console.log("[static] Dedup CSS: no duplicate data URIs in CSS bundle");
    return css;
  }

  // Hoist duplicates into CSS custom properties on :root so each is stored once.
  const variableDeclarations = duplicates
    .map(([uri], index) => `--inlined-asset-${index}:url("${uri}")`)
    .join(";");
  const rootBlock = `:root{${variableDeclarations}}`;

  let out = css;
  let totalSaved = 0;
  duplicates.forEach(([uri, count], index) => {
    out = out
      .replaceAll(`url("${uri}")`, `var(--inlined-asset-${index})`)
      .replaceAll(`url('${uri}')`, `var(--inlined-asset-${index})`);
    totalSaved += (count - 1) * uri.length;
  });

  console.log(
    `[static] Dedup CSS: extracted ${duplicates.length} duplicate data URI(s), saved ~${(totalSaved / 1024).toFixed(1)} KB`
  );
  return rootBlock + out;
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
      const startTime = Date.now();
      console.log("[static] Starting self-contained inlining pipeline");
      const assetsDirectory = resolve(outDirectory, "assets");
      console.log("[static] Reading built CSS/JS bundles");
      const { cssContent, jsContent } = readAssetBundles(assetsDirectory);

      const htmlPath = resolve(outDirectory, "index.html");
      console.log("[static] Reading generated HTML");
      const originalHtml = readFileSync(htmlPath, "utf-8");
      const { headContent, bodyContent } = splitHtml(originalHtml);

      const headInlined = await inlineExternalStylesheets(headContent);
      const headWithoutPreconnect = headInlined.replaceAll(
        /<link[^>]+rel=["']preconnect["'][^>]*\/?>/gi,
        ""
      );
      const { protectedHtml, replacements } = protectSocialPreviewMetaUrls(
        headWithoutPreconnect
      );
      console.log("[static] Inlining CSS bundle URLs");
      const cssInlined = await inlineLocalUrls(
        await inlineCssUrlReferences(
          await inlineExternalUrls(
            cssContent,
            "Inline external URLs in CSS bundle",
            logProgress
          ),
          "Inline CSS url(...) in CSS bundle",
          logProgress
        ),
        outDirectory
      );
      console.log("[static] Deduplicating data URIs in CSS bundle");
      const cssDeduped = deduplicateDataUrisInCss(cssInlined);
      console.log("[static] Inlining JS bundle URLs");
      const jsInlined = await inlineLocalUrls(
        await inlineExternalUrls(
          jsContent,
          "Inline external URLs in JS bundle",
          logProgress
        ),
        outDirectory
      );
      console.log("[static] Deduplicating data URIs in JS bundle");
      const jsDeduped = deduplicateDataUrisInJs(jsInlined);
      console.log("[static] Inlining body URLs");
      const bodyInlined = await inlineLocalUrls(
        await inlineExternalUrls(
          bodyContent,
          "Inline external URLs in body",
          logProgress
        ),
        outDirectory
      );

      const inlinedHtml = buildInlinedHtml(
        restoreSocialPreviewMetaUrls(
          await inlineLocalUrls(protectedHtml, outDirectory),
          replacements
        ),
        cssDeduped,
        jsDeduped,
        bodyInlined
      );

      writeFileSync(htmlPath, inlinedHtml);
      console.log("[static] Wrote inlined index.html");

      // Keep static output as a single self-contained file plus OG preview image.
      const filesToKeep = new Set(["index.html", "og-image.png"]);
      for (const entry of readdirSync(outDirectory)) {
        if (filesToKeep.has(entry)) {
          continue;
        }
        rmSync(resolve(outDirectory, entry), { recursive: true, force: true });
      }
      const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(
        `[static] Completed self-contained build cleanup in ${elapsedSeconds}s`
      );
    },
  };
}

function resolveStaticPath(basePath: string, ...segments: string[]) {
  const resolvedBase = isAbsolute(basePath)
    ? basePath
    : resolve(import.meta.dirname, basePath);
  return resolve(resolvedBase, ...segments);
}

function readJsonFile(pathname: string): unknown {
  if (!existsSync(pathname)) {
    return null;
  }
  try {
    return JSON.parse(readFileSync(pathname, "utf-8")) as unknown;
  } catch {
    return null;
  }
}

function toFileDataUrl(pathname: string) {
  const extension = pathname.split(".").pop()?.toLowerCase();
  const contentType =
    (extension ? STATIC_MEDIA_CONTENT_TYPES[`.${extension}`] : undefined) ??
    "application/octet-stream";
  const buffer = readFileSync(pathname);
  if (contentType === "image/svg+xml") {
    const decoded = buffer.toString("utf8");
    const encoded = encodeURIComponent(decoded)
      .replace(/'/g, "%27")
      .replace(/"/g, "%22");
    return `data:${contentType};charset=utf-8,${encoded}`;
  }
  return `data:${contentType};base64,${buffer.toString("base64")}`;
}

function embedTelegramMedia(publicDirectory: string, archive: unknown) {
  if (!archive || typeof archive !== "object") {
    return archive ?? null;
  }
  const typedArchive = archive as {
    messages?: {
      media?: ({ path?: string } & Record<string, unknown>)[];
    }[];
  };
  if (!Array.isArray(typedArchive.messages)) {
    return archive;
  }
  return {
    ...typedArchive,
    messages: typedArchive.messages.map((message) => {
      const media = Array.isArray(message.media) ? message.media : [];
      const mappedMedia = media.map((item) => {
        if (!item.path) {
          return item;
        }
        const cleanPath = item.path.startsWith("/")
          ? item.path.slice(1)
          : item.path;
        const absolutePath = resolveStaticPath(publicDirectory, cleanPath);
        if (!existsSync(absolutePath)) {
          return item;
        }
        return {
          ...item,
          path: toFileDataUrl(absolutePath),
        };
      });
      return {
        ...message,
        media: mappedMedia,
      };
    }),
  };
}

export default defineConfig(({ mode }) => {
  const isStatic = mode === "static";
  const outDirectory = isStatic ? "dist-static" : "dist";
  const publicDirectory =
    isStatic && process.env.STATIC_PUBLIC_DIR
      ? process.env.STATIC_PUBLIC_DIR
      : "public";
  const staticTelegramEs = isStatic
    ? embedTelegramMedia(
        publicDirectory,
        readJsonFile(
          resolveStaticPath(publicDirectory, "telegram", "messages.json")
        )
      )
    : null;
  const staticTelegramEn = isStatic
    ? embedTelegramMedia(
        publicDirectory,
        readJsonFile(
          resolveStaticPath(publicDirectory, "telegram", "messages.en.json")
        )
      )
    : null;

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
        chunkSizeWarningLimit: 2000,
        rollupOptions: {
          output: {
            inlineDynamicImports: true,
          },
        },
      }),
    },
    publicDir: publicDirectory,
    ...(isStatic && {
      define: {
        __STATIC_TELEGRAM_ES__: JSON.stringify(staticTelegramEs ?? null),
        __STATIC_TELEGRAM_EN__: JSON.stringify(staticTelegramEn ?? null),
      },
    }),
  };
});
