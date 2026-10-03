import { useState } from "react";
import { useTranslation } from "@/i18n";
import { downloadQr } from "@/lib/download";
import { shortUrl } from "@/lib/format";

interface LinkActionsProps {
  readonly slug: string;
}

/** Per-link actions: copy the short URL, download its QR as SVG or PNG. */
export function LinkActions({ slug }: Readonly<LinkActionsProps>) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const copy = () => {
    void navigator.clipboard.writeText(shortUrl(slug)).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 1500);
    });
  };
  return (
    <div className="actions">
      <button
        type="button"
        className="ghost-button"
        onClick={copy}
        data-content-section="links"
        data-content-id={`copy_${slug}`}
        data-cta-id="link_copy"
      >
        {copied ? t("links.copied") : t("links.copy")}
      </button>
      <button
        type="button"
        className="ghost-button"
        onClick={() => {
          void downloadQr(slug, "svg");
        }}
        data-content-section="links"
        data-content-id={`qr_svg_${slug}`}
        data-cta-id="link_qr"
        data-cta-variant="svg"
      >
        {t("links.qrSvg")}
      </button>
      <button
        type="button"
        className="ghost-button"
        onClick={() => {
          void downloadQr(slug, "png");
        }}
        data-content-section="links"
        data-content-id={`qr_png_${slug}`}
        data-cta-id="link_qr"
        data-cta-variant="png"
      >
        {t("links.qrPng")}
      </button>
    </div>
  );
}
