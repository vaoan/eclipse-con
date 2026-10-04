import QRCode from "qrcode";
import {
  QR_PRINT,
  printQr,
  qrFilename,
  qrPixelsPerMetre,
  qrSvg,
  withPngDensity,
} from "@/lib/qr";

/**
 * Saves a blob under a filename via a temporary link.
 *
 * @param blob - File contents.
 * @param filename - Suggested name.
 */
export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 0);
}

/**
 * Downloads a slug's QR at the print standard ({@link QR_PRINT}): the SVG is
 * sized in mm and the PNG carries its pixel density, so either one opens at
 * the same physical size (14.5 mm for `s27`) in Photoshop or Illustrator.
 *
 * @param slug - Link slug.
 * @param format - `svg` (vector, preferred for print) or `png`.
 * @returns Resolves once the download is triggered.
 */
export async function downloadQr(
  slug: string,
  format: "svg" | "png"
): Promise<void> {
  const qr = printQr(slug);
  if (format === "svg") {
    saveBlob(
      new Blob([qrSvg(qr)], { type: "image/svg+xml" }),
      qrFilename(slug, qr, "svg")
    );
    return;
  }
  // `scale` is pixels per module: a whole number keeps every edge crisp.
  const dataUrl = await QRCode.toDataURL(qr.text, {
    errorCorrectionLevel: QR_PRINT.errorCorrectionLevel,
    margin: QR_PRINT.quietZoneModules,
    scale: QR_PRINT.pngPixelsPerModule,
  });
  const raw = new Uint8Array(await (await fetch(dataUrl)).arrayBuffer());
  const png = withPngDensity(raw, qrPixelsPerMetre());
  saveBlob(new Blob([png], { type: "image/png" }), qrFilename(slug, qr, "png"));
}
