/**
 * Regenerates the card-sized copies of the showcase photos.
 *
 * The cards render around 232px wide, but the source photos are 626–1200px so
 * that the lightbox has something to show. Serving the full files to the cards
 * meant a phone downloading ~95KB per thumbnail it displays at a quarter of the
 * size. These copies are ~480px (2x the card, so it stays sharp on retina) and
 * land around 20KB each.
 *
 * The output is committed alongside the originals, so the site build needs no
 * image tooling. Run this only when a showcase photo is added or replaced:
 *
 *   node scripts/generate-thumbs.mjs
 *
 * It borrows `sharp` from the workspace rather than adding a native dependency
 * to this app. If that is unavailable, install it in the workspace root first.
 */
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { readdir, mkdir, stat } from "node:fs/promises";
import { join, dirname, basename } from "node:path";

/** Width of the generated copies: covers the largest card (~291px) at 2x. */
const THUMB_WIDTH = 640;

const here = dirname(fileURLToPath(import.meta.url));
const sourceDir = join(here, "..", "src", "assets", "showcase");
const outputDir = join(sourceDir, "thumbs");

const require = createRequire(import.meta.url);
let sharp;
try {
  sharp = require("sharp");
} catch {
  console.error(
    "sharp is not resolvable from this workspace.\n" +
      "Install it at the workspace root (pnpm add -Dw sharp), then re-run."
  );
  process.exit(2);
}

await mkdir(outputDir, { recursive: true });

const files = (await readdir(sourceDir)).filter((name) =>
  name.endsWith(".webp")
);

let savedBytes = 0;
for (const name of files) {
  const from = join(sourceDir, name);
  const to = join(outputDir, name);
  await sharp(from)
    .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
    .webp({ quality: 78 })
    .toFile(to);

  const before = (await stat(from)).size;
  const after = (await stat(to)).size;
  savedBytes += before - after;
  console.log(
    `${basename(name).padEnd(22)} ${(before / 1024).toFixed(0).padStart(4)} KB -> ${(after / 1024).toFixed(0).padStart(3)} KB`
  );
}

console.log(
  `\n${files.length} thumbnails, ${(savedBytes / 1024).toFixed(0)} KB lighter in total.`
);

// The hero is 1920px so desktops get a crisp full-bleed image, but phones were
// downloading all of it. A 1280px copy covers a 390px viewport even at 3x, and
// `srcset` lets the browser take the smaller one when that is all it needs.
const heroDir = join(here, "..", "src", "assets", "hero");
const heroSource = join(heroDir, "banner.webp");
const heroNarrow = join(heroDir, "banner-1280.webp");

await sharp(heroSource)
  .resize({ width: 1280, withoutEnlargement: true })
  .webp({ quality: 80 })
  .toFile(heroNarrow);

console.log(
  `banner.webp            ${((await stat(heroSource)).size / 1024).toFixed(0).padStart(4)} KB -> ${((await stat(heroNarrow)).size / 1024).toFixed(0).padStart(3)} KB at 1280px`
);
