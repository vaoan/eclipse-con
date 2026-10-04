import { describe, expect, it } from "vitest";
import {
  printQr,
  qrFilename,
  qrPixelsPerMetre,
  qrSvg,
  qrText,
  withPngDensity,
} from "@/lib/qr";

/** Minimal valid PNG: signature, 1×1 IHDR, IEND (CRCs from the PNG spec). */
const TINY_PNG = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  // IHDR: length 13, "IHDR", 1×1, depth 8, colour 0, crc
  0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00,
  0x00, 0x00, 0x01, 0x08, 0x00, 0x00, 0x00, 0x00, 0x3a, 0x7e, 0x9b, 0x55,
  // IEND
  0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
]);

/** The chunk types of a PNG, in order. */
function chunkTypes(png: Uint8Array): string[] {
  const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
  const types: string[] = [];
  let offset = 8;
  while (offset < png.byteLength) {
    const length = view.getUint32(offset);
    types.push(String.fromCharCode(...png.subarray(offset + 4, offset + 8)));
    offset += 12 + length;
  }
  return types;
}

describe("print QR", () => {
  it("encodes the upper-case short URL", () => {
    expect(qrText("s27")).toBe("HTTPS://FCO.BZ/S27");
  });

  it("fits s27 in version 1 at 14.5 mm with the quiet zone", () => {
    const qr = printQr("s27");
    expect(qr).toMatchObject({ version: 1, modules: 21, side: 29 });
    expect(qr.widthMm).toBe(14.5);
  });

  it("keeps the module size fixed when a longer slug needs a bigger version", () => {
    const qr = printQr("sunfest-2027-telegram");
    expect(qr.version).toBeGreaterThan(1);
    expect(qr.widthMm).toBe(qr.side * 0.5);
  });

  it("sizes the SVG in millimetres", () => {
    const svg = qrSvg(printQr("s27"));
    expect(svg).toContain('width="14.5mm" height="14.5mm"');
    expect(svg).toContain('viewBox="0 0 29 29"');
  });

  it("names files with their print size", () => {
    expect(qrFilename("s27", printQr("s27"), "png")).toBe(
      "fco-bz-s27-qr-14.5mm.png"
    );
  });

  it("uses 48,000 px/m: 24 px per 0.5 mm module", () => {
    expect(qrPixelsPerMetre()).toBe(48_000);
  });
});

describe("withPngDensity", () => {
  it("inserts a pHYs chunk right after IHDR with a valid CRC", () => {
    const png = withPngDensity(TINY_PNG, 48_000);
    expect(chunkTypes(png)).toEqual(["IHDR", "pHYs", "IEND"]);
    const view = new DataView(png.buffer);
    const at = 33; // signature + IHDR
    expect(view.getUint32(at + 8)).toBe(48_000);
    expect(view.getUint32(at + 12)).toBe(48_000);
    expect(png[at + 16]).toBe(1);
    // CRC of "pHYs" + 0x0000BB80 0x0000BB80 0x01, from Node's zlib.crc32.
    expect(view.getUint32(at + 17)).toBe(0x242f909c);
  });

  it("replaces an existing pHYs instead of adding a second", () => {
    const twice = withPngDensity(withPngDensity(TINY_PNG, 2835), 48_000);
    expect(chunkTypes(twice)).toEqual(["IHDR", "pHYs", "IEND"]);
    expect(new DataView(twice.buffer).getUint32(41)).toBe(48_000);
  });
});
