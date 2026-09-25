#!/usr/bin/env node
/**
 * Generate a print-ready QR code with a logo in the centre.
 *
 * The QR is encoded at error-correction level H, which survives up to 30 %
 * of its modules being covered. The logo sits on a white rounded plate that
 * covers well under that budget, so the code stays scannable with a margin.
 *
 * Output format follows the `--out` extension:
 *   .png  raster, `--size` pixels wide; with `--mm` it also carries print
 *         density so layout tools open it at that physical width.
 *   .svg  vector modules with the logo embedded, sized in millimetres via
 *         `--mm` (default 50). Prefer this for anything that goes to print.
 *
 * Without `--logo` the code is plain; pair that with `--ec M` for the
 * smallest code the URL allows, since the 30 % budget of level H only earns
 * its extra modules when something covers the centre.
 *
 * Usage:
 *   node scripts/make-qr.mjs --url <url> --out <file.png|svg> [--logo <image>]
 *                            [--ec H] [--size 2048] [--mm 50]
 *                            [--logo-scale 0.22] [--dark #000000]
 *
 * Example:
 *   pnpm qr:sunfest2027
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, extname, resolve } from "node:path";
import { parseArgs } from "node:util";
import QRCode from "qrcode";
import sharp from "sharp";

/** Fraction of the QR width the plate's padding around the logo takes. */
const PLATE_PADDING_SCALE = 0.03;
/** Corner radius of the plate and the logo, as a fraction of their size. */
const CORNER_RADIUS_SCALE = 0.18;
/** Quiet zone around the code, in modules, as the QR spec recommends. */
const QUIET_ZONE_MODULES = 4;
const MM_PER_INCH = 25.4;
/** Pixels rendered per module in the SVG's embedded logo raster. */
const SVG_LOGO_PX_PER_MODULE = 24;

const { values: args } = parseArgs({
  options: {
    url: { type: "string" },
    logo: { type: "string" },
    out: { type: "string" },
    ec: { type: "string", default: "H" },
    size: { type: "string", default: "2048" },
    mm: { type: "string" },
    "logo-scale": { type: "string", default: "0.22" },
    dark: { type: "string", default: "#000000" },
  },
});

if (!args.url || !args.out) {
  console.error(
    "Usage: node scripts/make-qr.mjs --url <url> --out <file.png|svg> [--logo <image>] [--ec L|M|Q|H]"
  );
  process.exit(1);
}

const errorCorrectionLevel = args.ec.toUpperCase();
const hasLogo = Boolean(args.logo);
const logoScale = Number.parseFloat(args["logo-scale"]);
const outPath = resolve(args.out);
const isSvg = extname(outPath).toLowerCase() === ".svg";
const widthMm = args.mm ? Number.parseFloat(args.mm) : isSvg ? 50 : undefined;

/** Geometry of the plate and logo for a code `side` units wide. */
function layout(side) {
  const logo = side * logoScale;
  const plate = logo + side * PLATE_PADDING_SCALE * 2;
  return {
    logo,
    plate,
    logoOffset: (side - logo) / 2,
    plateOffset: (side - plate) / 2,
  };
}

/** An SVG rounded square, used both as a white plate and as an alpha mask. */
function roundedSquare(side, fill) {
  const radius = Math.round(side * CORNER_RADIUS_SCALE);
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${side}" height="${side}">` +
      `<rect width="${side}" height="${side}" rx="${radius}" fill="${fill}"/>` +
      `</svg>`
  );
}

/** The logo resized to `side` pixels with rounded corners, as a PNG buffer. */
async function roundedLogo(side) {
  return sharp(resolve(args.logo))
    .resize(side, side, { fit: "cover" })
    .composite([{ input: roundedSquare(side, "#ffffff"), blend: "dest-in" }])
    .png()
    .toBuffer();
}

async function renderPng() {
  const size = Number.parseInt(args.size, 10);
  const { logo, plate, logoOffset, plateOffset } = layout(size);
  const logoSize = Math.round(logo);
  const plateSize = Math.round(plate);

  const qrPng = await QRCode.toBuffer(args.url, {
    type: "png",
    errorCorrectionLevel,
    width: size,
    margin: QUIET_ZONE_MODULES,
    color: { dark: args.dark, light: "#ffffff" },
  });

  let image = sharp(qrPng);
  if (hasLogo) {
    image = image.composite([
      {
        input: roundedSquare(plateSize, "#ffffff"),
        left: Math.round(plateOffset),
        top: Math.round(plateOffset),
      },
      {
        input: await roundedLogo(logoSize),
        left: Math.round(logoOffset),
        top: Math.round(logoOffset),
      },
    ]);
  }

  if (widthMm) {
    // Density is what layout tools read to place the image at a physical size.
    image = image.withMetadata({ density: size / (widthMm / MM_PER_INCH) });
  }

  return {
    buffer: await image.png().toBuffer(),
    note:
      `${size}x${size}px, level ${errorCorrectionLevel}` +
      (hasLogo ? `, logo ${logoSize}px` : ", no logo") +
      (widthMm ? `, prints at ${widthMm}mm` : ""),
  };
}

async function renderSvg() {
  const qr = QRCode.create(args.url, { errorCorrectionLevel });
  const modules = qr.modules.size;
  const side = modules + QUIET_ZONE_MODULES * 2;
  const { logo, plate, logoOffset, plateOffset } = layout(side);

  // One path for every dark module, in module units, so the code stays vector.
  let d = "";
  for (let row = 0; row < modules; row += 1) {
    for (let col = 0; col < modules; col += 1) {
      if (qr.modules.get(row, col)) {
        d += `M${col + QUIET_ZONE_MODULES} ${row + QUIET_ZONE_MODULES}h1v1h-1z`;
      }
    }
  }

  const fmt = (n) => Number(n.toFixed(3));
  let overlay = "";
  if (hasLogo) {
    const logoPx = Math.round(logo * SVG_LOGO_PX_PER_MODULE);
    const logoData = (await roundedLogo(logoPx)).toString("base64");
    overlay =
      `  <rect x="${fmt(plateOffset)}" y="${fmt(plateOffset)}" width="${fmt(plate)}" height="${fmt(plate)}" rx="${fmt(plate * CORNER_RADIUS_SCALE)}" fill="#ffffff"/>\n` +
      `  <image x="${fmt(logoOffset)}" y="${fmt(logoOffset)}" width="${fmt(logo)}" height="${fmt(logo)}" href="data:image/png;base64,${logoData}"/>\n`;
  }

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${widthMm}mm" height="${widthMm}mm" viewBox="0 0 ${side} ${side}">\n` +
    `  <rect width="${side}" height="${side}" fill="#ffffff"/>\n` +
    `  <path d="${d}" fill="${args.dark}"/>\n` +
    overlay +
    `</svg>\n`;

  return {
    buffer: Buffer.from(svg),
    note:
      `${widthMm}mm, level ${errorCorrectionLevel}, version ${qr.version} (${modules} modules)` +
      (hasLogo ? `, logo ${fmt(logo)} modules` : ", no logo"),
  };
}

const { buffer, note } = isSvg ? await renderSvg() : await renderPng();
await mkdir(dirname(outPath), { recursive: true });
await writeFile(outPath, buffer);
console.log(`Wrote ${outPath} (${note})`);
