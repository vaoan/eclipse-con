import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useRef } from "react";
import { useTranslation } from "@/i18n";
import { LightboxFigure } from "@/components/LightboxFigure";
import type { ShowcaseItem } from "@/showcase";
import { tid } from "@/lib/tid";
import { useLightboxKeyboard } from "@/lib/useLightboxKeyboard";

/** Props for {@link Lightbox}. */
interface LightboxProps {
  readonly items: readonly ShowcaseItem[];
  /** Index of the open item, or `null` when the lightbox is closed. */
  readonly index: number | null;
  readonly onClose: () => void;
  /** Navigate to another item by absolute index. */
  readonly onNavigate: (nextIndex: number) => void;
}

const SWIPE_THRESHOLD_PX = 40;

/**
 * Full-screen photo carousel. Shows one image with its title/blurb on the
 * image footer, and supports prev/next buttons, arrow keys, swipe, and Escape.
 * Renders nothing when `index` is `null`.
 */
export function Lightbox({
  items,
  index,
  onClose,
  onNavigate,
}: Readonly<LightboxProps>) {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const open = index !== null;
  const total = items.length;

  const go = useCallback(
    (delta: number) => {
      if (index === null) {
        return;
      }
      onNavigate((index + delta + total) % total);
    },
    [index, total, onNavigate]
  );

  useLightboxKeyboard({ open, dialogRef, onClose, onStep: go });

  if (index === null) {
    return null;
  }
  const current = items[index];
  if (!current) {
    return null;
  }

  return (
    <div
      ref={dialogRef}
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={t("lightbox.label")}
      tabIndex={-1}
      data-testid={tid("lightbox")}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        if (touchStartX.current === null) {
          return;
        }
        const dx =
          (event.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
        if (Math.abs(dx) > SWIPE_THRESHOLD_PX) {
          go(dx < 0 ? 1 : -1);
        }
        touchStartX.current = null;
      }}
    >
      <button
        type="button"
        className="lightbox-close"
        aria-label={t("lightbox.close")}
        onClick={onClose}
        data-content-section="showcase"
        data-content-id="lightbox_close"
      >
        <X className="size-6" aria-hidden="true" />
      </button>

      <button
        type="button"
        className="lightbox-nav lightbox-prev"
        aria-label={t("lightbox.prev")}
        onClick={() => {
          go(-1);
        }}
        data-content-section="showcase"
        data-content-id="lightbox_prev"
      >
        <ChevronLeft className="size-7" aria-hidden="true" />
      </button>

      <LightboxFigure item={current} index={index} total={total} />

      <button
        type="button"
        className="lightbox-nav lightbox-next"
        aria-label={t("lightbox.next")}
        onClick={() => {
          go(1);
        }}
        data-content-section="showcase"
        data-content-id="lightbox_next"
      >
        <ChevronRight className="size-7" aria-hidden="true" />
      </button>
    </div>
  );
}
