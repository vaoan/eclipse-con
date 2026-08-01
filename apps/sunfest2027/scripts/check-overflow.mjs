/**
 * Horizontal-overflow regression check.
 *
 * Loads the built single-file artifact at a range of viewport widths and fails
 * if the document scrolls sideways at any of them. Sideways scroll is invisible
 * on a desktop browser but wrecks the site on phones, and it is usually caused
 * by one element's intrinsic width rather than anything the eye can spot, so
 * this reports the offending elements instead of just the verdict.
 *
 * Usage:
 *   pnpm check:overflow                  # the local dist-static artifact
 *   pnpm check:overflow <url>            # e.g. the deployed site
 *
 * Needs a Chromium build. `pnpm exec playwright install chromium` provides one;
 * failing that, set PLAYWRIGHT_CHROMIUM_PATH to an existing executable.
 */
import { existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

/** Viewport widths to check: common phones, tablet, and desktop breakpoints. */
const WIDTHS = [320, 360, 390, 414, 768, 1024, 1280, 1440];

/** Viewport height; tall enough that sections settle at a realistic size. */
const HEIGHT = 900;

/** Tolerance in px — sub-pixel layout rounding is not a real overflow. */
const SLACK = 1;

/** The built artifact this check defaults to. */
const ARTIFACT = fileURLToPath(
  new URL("../dist-static/index.html", import.meta.url)
);

/**
 * Finds a usable Chromium, preferring an explicit path, then Playwright's own
 * resolution, then whatever build exists in the Playwright browser cache. The
 * cache lookup keeps the check runnable when the installed browser revision is
 * newer than the one this Playwright release pins.
 *
 * @returns Launch options for chromium.launch().
 */
function resolveChromium() {
  const explicit = process.env.PLAYWRIGHT_CHROMIUM_PATH;
  if (explicit) return { executablePath: explicit };

  const cacheRoot =
    process.env.PLAYWRIGHT_BROWSERS_PATH ??
    (process.platform === "win32"
      ? join(process.env.LOCALAPPDATA ?? "", "ms-playwright")
      : process.platform === "darwin"
        ? join(homedir(), "Library", "Caches", "ms-playwright")
        : join(homedir(), ".cache", "ms-playwright"));

  if (!existsSync(cacheRoot)) return {};

  // Newest revision first; the headless shell is smaller and enough for this.
  const candidates = readdirSync(cacheRoot)
    .filter((name) => /^chromium(_headless_shell)?-\d+$/.test(name))
    .sort((a, b) => Number(b.split("-")[1]) - Number(a.split("-")[1]))
    .flatMap((name) => [
      join(
        cacheRoot,
        name,
        "chrome-headless-shell-win64",
        "chrome-headless-shell.exe"
      ),
      join(cacheRoot, name, "chrome-win64", "chrome.exe"),
      join(cacheRoot, name, "chrome-linux", "chrome"),
      join(
        cacheRoot,
        name,
        "chrome-headless-shell-linux",
        "chrome-headless-shell"
      ),
      join(
        cacheRoot,
        name,
        "chrome-mac",
        "Chromium.app",
        "Contents",
        "MacOS",
        "Chromium"
      ),
    ]);

  const found = candidates.find((path) => existsSync(path));
  return found ? { executablePath: found } : {};
}

/**
 * Measures one viewport width.
 *
 * @param browser - An open Chromium instance.
 * @param target - URL to load.
 * @param width - Viewport width in px.
 * @returns The document widths plus any elements that reach past an edge.
 */
async function measure(browser, target, width) {
  const page = await browser.newPage({ viewport: { width, height: HEIGHT } });
  try {
    await page.goto(target, { waitUntil: "load" });

    // Sections reveal on scroll, so walk the page before measuring — an
    // unrevealed section has no layout to overflow with.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 60));
      }
      window.scrollTo(0, 0);
      await new Promise((resolve) => setTimeout(resolve, 250));
    });

    return await page.evaluate((slack) => {
      const doc = document.documentElement;
      const docWidth = doc.clientWidth;

      /** Elements clipped by an ancestor cannot widen the page — skip them. */
      const isClipped = (el) => {
        for (let n = el.parentElement; n && n !== doc; n = n.parentElement) {
          const overflowX = getComputedStyle(n).overflowX;
          if (overflowX !== "visible") return true;
        }
        return false;
      };

      const describe = (el) => {
        const cls =
          typeof el.className === "string" && el.className.trim()
            ? "." + el.className.trim().split(/\s+/).join(".")
            : "";
        return el.tagName.toLowerCase() + (el.id ? `#${el.id}` : "") + cls;
      };

      const offenders = [];
      for (const el of document.querySelectorAll("*")) {
        const rect = el.getBoundingClientRect();
        if (!rect.width && !rect.height) continue;
        const style = getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden") continue;
        if (rect.right <= docWidth + slack && rect.left >= -slack) continue;
        if (isClipped(el)) continue;
        offenders.push({
          selector: describe(el),
          section:
            el
              .closest("[data-content-section]")
              ?.getAttribute("data-content-section") ?? "(none)",
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
        });
      }

      return {
        docWidth,
        scrollWidth: doc.scrollWidth,
        offenders: offenders.slice(0, 8),
        offenderCount: offenders.length,
      };
    }, SLACK);
  } finally {
    await page.close();
  }
}

const [, , urlArg] = process.argv;

if (!urlArg && !existsSync(ARTIFACT)) {
  console.error(
    `No built artifact at ${ARTIFACT}\nRun "pnpm build:static" first, or pass a URL to check.`
  );
  process.exit(2);
}

const target = urlArg ?? pathToFileURL(ARTIFACT).href;

let browser;
try {
  browser = await chromium.launch(resolveChromium());
} catch (error) {
  console.error(
    `Could not launch Chromium: ${error.message}\n` +
      `Install one with "pnpm exec playwright install chromium", or set PLAYWRIGHT_CHROMIUM_PATH.`
  );
  process.exit(2);
}

console.log(`Checking ${target}\n`);

let failed = false;
try {
  for (const width of WIDTHS) {
    const { docWidth, scrollWidth, offenders, offenderCount } = await measure(
      browser,
      target,
      width
    );
    const overflow = scrollWidth - docWidth;

    if (overflow > SLACK) {
      failed = true;
      console.log(
        `✗ ${String(width).padStart(4)}px — scrolls ${overflow}px sideways (client ${docWidth}, scroll ${scrollWidth})`
      );
      for (const o of offenders) {
        console.log(
          `      [${o.section}] ${o.selector} — ${o.left}..${o.right} (w=${o.width})`
        );
      }
      if (offenderCount > offenders.length) {
        console.log(`      …and ${offenderCount - offenders.length} more`);
      }
    } else {
      console.log(`✓ ${String(width).padStart(4)}px`);
    }
  }
} finally {
  await browser.close();
}

if (failed) {
  console.error(
    "\nHorizontal overflow detected. An element is wider than the viewport — " +
      "usually an intrinsic minimum (a grid track, a fixed width, or an " +
      "unbreakable string) that cannot shrink."
  );
  process.exit(1);
}

console.log("\nNo horizontal overflow at any checked width.");
