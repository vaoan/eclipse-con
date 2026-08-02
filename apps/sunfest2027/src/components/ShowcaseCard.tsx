import { useTranslation } from "@/i18n";
import type { ShowcaseItem } from "@/showcase";
import { cn } from "@/lib/cn";

/** Props for {@link ShowcaseCard}. */
interface ShowcaseCardProps {
  readonly item: ShowcaseItem;
  readonly onOpen: () => void;
  /** Render as a tall portrait card (used for room photos). */
  readonly tall?: boolean;
}

/** A cream-framed, clickable resort photo that opens the lightbox. */
export function ShowcaseCard({
  item,
  onOpen,
  tall,
}: Readonly<ShowcaseCardProps>) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      className={cn("showcase-card", tall && "showcase-card-tall")}
      onClick={onOpen}
      aria-label={t("showcase.openItem", { title: t(item.titleKey) })}
      data-content-section="showcase"
      data-content-id={`open_${item.id}`}
      data-content-interaction="open"
    >
      <img
        src={item.thumb}
        alt=""
        loading="lazy"
        decoding="async"
        className="showcase-card-img"
      />
      <span className="showcase-card-caption">{t(item.titleKey)}</span>
    </button>
  );
}
