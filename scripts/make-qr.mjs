#!/usr/bin/env node
/**
 * Generate a print-ready QR code PNG with a logo in the centre.
 *
 * The QR is encoded at error-correction level H, which survives up to 30 %
 * of its modules being covered. The logo sits on a white rounded plate that
 * covers well under that budget, so the code stays scannable with a margin.
 *
 * Usage:
 *   node scripts/make-qr.mjs --url <url> --logo <image> --out <file.png>
 *                            [--size 2048] [--logo-scale 0.22] [--dark #000000]
 *
 * Example:
 *   pnpm qr:sunfest2027
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { parseArgs } from "node:util";
import QRCode from "qrcode";
import sharp from "sharp";

/** Fraction of the QR width the plate's padding around the logo takes. */
const PLATE_PADDING_SCALE = 0.03;
/** Corner radius of the plate and the logo, as a fraction of their size. */
const CORNER_RADIUS_SCALE = 0.18;
/** Quiet zone around the code, in modules, as the QR spec recommends. */
const QUIET_ZONE_MODULES = 4;

const { values: args } = parseArgs({
  options: {
    url: { type: "string" },
    logo: { type: "string" },
    out: { type: "string" },
    size: { type: "string", default: "2048" },
    "logo-scale": { type: "string", default: "0.22" },
    dark: { type: "string", default: "#000000" },
  },
});

if (!args.url || !args.logo || !args.out) {
  console.error(
    "Usage: node scripts/make-qr.mjs --url <url> --logo <image> --out <file.png>"
  );
  process.exit(1);
}

const size = Number.parseInt(args.size, 10);
const logoScale = Number.parseFloat(args["logo-scale"]);
const logoSize = Math.round(size * logoScale);
const plateSize = Math.round(logoSize + size * PLATE_PADDING_SCALE * 2);

/** An SVG rounded square, used both as a white plate and as an alpha mask. */
function roundedSquare(side, fill) {
  const radius = Math.round(side * CORNER_RADIUS_SCALE);
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${side}" height="${side}">` +
      `<rect width="${side}" height="${side}" rx="${radius}" fill="${fill}"/>` +
      `</svg>`
  );
}

const qrPng = await QRCode.toBuffer(args.url, {
  type: "png",
  errorCorrectionLevel: "H",
  width: size,
  margin: QUIET_ZONE_MODULES,
  color: { dark: args.dark, light: "#ffffff" },
});

const logoPng = await sharp(resolve(args.logo))
  .resize(logoSize, logoSize, { fit: "cover" })
  .composite([{ input: roundedSquare(logoSize, "#ffffff"), blend: "dest-in" }])
  .png()
  .toBuffer();

const centre = (side) => Math.round((size - side) / 2);

const output = await sharp(qrPng)
  .composite([
    {
      input: roundedSquare(plateSize, "#ffffff"),
      left: centre(plateSize),
      top: centre(plateSize),
    },
    { input: logoPng, left: centre(logoSize), top: centre(logoSize) },
  ])
  .png()
  .toBuffer();

const outPath = resolve(args.out);
await mkdir(dirname(outPath), { recursive: true });
await writeFile(outPath, output);
console.log(`Wrote ${outPath} (${size}x${size}, logo ${logoSize}px)`);
