import QRCode from "qrcode";
import { shortUrl } from "@/lib/format";

/**
 * QR settings matching the plain print codes made by `scripts/make-qr.mjs`
 * with `--ec M` (no logo, so level H's extra redundancy buys nothing) and the
 * spec's 4-module quiet zone.
 */
const QR_OPTIONS = { errorCorrectionLevel: "M", margin: 4 } as const;
/** PNG edge in pixels: ~600 dpi at 30 mm. */
const PNG_SIZE = 709;

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
 * Downloads the QR code for a slug's short URL.
 *
 * @param slug - Link slug.
 * @param format - `svg` (vector, for print) or `png`.
 * @returns Resolves once the download is triggered.
 */
export async function downloadQr(
  slug: string,
  format: "svg" | "png"
): Promise<void> {
  // Full https URL: every phone camera opens it as a link, whereas a bare
  // `fco.bz/x` is left to each scanner's guesswork.
  const url = shortUrl(slug);
  if (format === "svg") {
    const svg = await QRCode.toString(url, { ...QR_OPTIONS, type: "svg" });
    saveBlob(
      new Blob([svg], { type: "image/svg+xml" }),
      `fco-bz-${slug}-qr.svg`
    );
    return;
  }
  const dataUrl = await QRCode.toDataURL(url, {
    ...QR_OPTIONS,
    width: PNG_SIZE,
  });
  const blob = await (await fetch(dataUrl)).blob();
  saveBlob(blob, `fco-bz-${slug}-qr.png`);
}
