import QRCode from "qrcode";
import { shortUrl } from "@/lib/format";

/**
 * Print standard for every fco.bz QR, the one the publicity size ladder
 * (`publicity/fco-bz-s27-size-ladder.svg`) settled on: the smallest code a
 * phone reads at a glance from 30 cm.
 *
 * - **Upper-case URL** (`HTTPS://FCO.BZ/S27`): QR's alphanumeric mode packs it
 *   far tighter than lower-case bytes, so short slugs fit version 1 (21×21).
 *   Scheme and host are case-insensitive and the Worker lower-cases slugs.
 * - **Level M, no logo**: level H's extra redundancy only pays off when a logo
 *   covers modules.
 * - **0.5 mm modules** with a **4-module quiet zone**; the printed size then
 *   follows from the QR version (s27 → 10.5 mm code, 14.5 mm with margin).
 */
export const QR_PRINT = {
  errorCorrectionLevel: "M",
  moduleMm: 0.5,
  quietZoneModules: 4,
  /** PNG pixels per module: whole pixels keep edges crisp; 24 → ~1219 ppi. */
  pngPixelsPerModule: 24,
} as const;

const MM_PER_METRE = 1000;

/** A QR laid out for print. */
export interface PrintQr {
  /** The text encoded (upper-case short URL). */
  readonly text: string;
  /** QR version (1 = 21×21 modules). */
  readonly version: number;
  /** Modules per side, without the quiet zone. */
  readonly modules: number;
  /** Modules per side, with the quiet zone. */
  readonly side: number;
  /** Printed width (and height) in mm, quiet zone included. */
  readonly widthMm: number;
  /** Whether the module at (row, col) of the code (no quiet zone) is dark. */
  readonly isDark: (row: number, col: number) => boolean;
}

/**
 * The text a slug's QR encodes: its short URL in upper case.
 *
 * @param slug - Link slug.
 * @returns e.g. `HTTPS://FCO.BZ/S27`.
 */
export function qrText(slug: string): string {
  return shortUrl(slug).toUpperCase();
}

/**
 * Lays out a slug's QR at the print standard.
 *
 * @param slug - Link slug.
 * @returns Geometry and module lookup.
 */
export function printQr(slug: string): PrintQr {
  const text = qrText(slug);
  const qr = QRCode.create(text, {
    errorCorrectionLevel: QR_PRINT.errorCorrectionLevel,
  });
  const modules = qr.modules.size;
  const side = modules + QR_PRINT.quietZoneModules * 2;
  return {
    text,
    version: qr.version,
    modules,
    side,
    widthMm: side * QR_PRINT.moduleMm,
    isDark: (row, col) => Boolean(qr.modules.get(row, col)),
  };
}

/**
 * Vector QR sized in millimetres, so Illustrator, Photoshop or InDesign place
 * it at its print size. One path in module units; crisp edges.
 *
 * @param qr - From {@link printQr}.
 * @returns SVG markup.
 */
export function qrSvg(qr: PrintQr): string {
  const offset = QR_PRINT.quietZoneModules;
  let path = "";
  for (let row = 0; row < qr.modules; row += 1) {
    for (let col = 0; col < qr.modules; col += 1) {
      if (qr.isDark(row, col)) {
        path += `M${col + offset} ${row + offset}h1v1h-1z`;
      }
    }
  }
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${qr.widthMm}mm" height="${qr.widthMm}mm" ` +
    `viewBox="0 0 ${qr.side} ${qr.side}" shape-rendering="crispEdges">\n` +
    `  <title>${qr.text}</title>\n` +
    `  <rect width="${qr.side}" height="${qr.side}" fill="#ffffff"/>\n` +
    `  <path d="${path}" fill="#000000"/>\n` +
    `</svg>\n`
  );
}

/**
 * PNG pixel density for the print standard, in pixels per metre (the unit of
 * PNG's pHYs chunk). 24 px per 0.5 mm module is exactly 48,000 px/m.
 *
 * @returns Pixels per metre.
 */
export function qrPixelsPerMetre(): number {
  return Math.round(
    (QR_PRINT.pngPixelsPerModule / QR_PRINT.moduleMm) * MM_PER_METRE
  );
}

/** CRC-32 (PNG chunk checksum), table built once. */
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc = (CRC_TABLE[(crc ^ byte) & 0xff] ?? 0) ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/** PNG signature (8 bytes) + IHDR chunk (4 len + 4 type + 13 data + 4 crc). */
const AFTER_IHDR = 8 + 25;

/**
 * Sets a PNG's physical pixel density (pHYs chunk) so layout programs open it
 * at its print size instead of 72 dpi. Any existing pHYs chunk is replaced.
 *
 * @param png - PNG file bytes.
 * @param pixelsPerMetre - Density for both axes.
 * @returns New PNG bytes.
 */
export function withPngDensity(
  png: Uint8Array,
  pixelsPerMetre: number
): Uint8Array<ArrayBuffer> {
  const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
  const chunks: Uint8Array[] = [png.subarray(0, AFTER_IHDR)];
  let offset = AFTER_IHDR;
  while (offset < png.byteLength) {
    const length = view.getUint32(offset);
    const type = String.fromCharCode(...png.subarray(offset + 4, offset + 8));
    const end = offset + 12 + length;
    if (type !== "pHYs") {
      chunks.push(png.subarray(offset, end));
    }
    offset = end;
  }

  const phys = new Uint8Array(4 + 4 + 9 + 4);
  const physView = new DataView(phys.buffer);
  physView.setUint32(0, 9);
  phys.set([0x70, 0x48, 0x59, 0x73], 4); // "pHYs"
  physView.setUint32(8, pixelsPerMetre);
  physView.setUint32(12, pixelsPerMetre);
  phys[16] = 1; // unit: metre
  physView.setUint32(17, crc32(phys.subarray(4, 17)));
  chunks.splice(1, 0, phys);

  const out = new Uint8Array(chunks.reduce((sum, c) => sum + c.byteLength, 0));
  let at = 0;
  for (const chunk of chunks) {
    out.set(chunk, at);
    at += chunk.byteLength;
  }
  return out;
}

/**
 * File name that tells a designer the print size at a glance.
 *
 * @param slug - Link slug.
 * @param qr - From {@link printQr}.
 * @param extension - `svg` or `png`.
 * @returns e.g. `fco-bz-s27-qr-14.5mm.svg`.
 */
export function qrFilename(
  slug: string,
  qr: PrintQr,
  extension: "svg" | "png"
): string {
  return `fco-bz-${slug}-qr-${qr.widthMm}mm.${extension}`;
}
