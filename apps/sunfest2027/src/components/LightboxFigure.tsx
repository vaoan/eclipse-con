import { useTranslation } from "react-i18next";
import type { ShowcaseItem } from "@/showcase";

/** Props for {@link LightboxFigure}. */
interface LightboxFigureProps {
  readonly item: ShowcaseItem;
  /** Zero-based index of this item, for the counter. */
  readonly index: number;
  readonly total: number;
}

/** The lightbox image with its counter, title and blurb on the image footer. */
export function LightboxFigure({
  item,
  index,
  total,
}: Readonly<LightboxFigureProps>) {
  const { t } = useTranslation();
  return (
    <figure className="lightbox-figure">
      <img src={item.src} alt={t(item.altKey)} className="lightbox-img" />
      <figcaption className="lightbox-caption">
        <span className="lightbox-count">
          {t("lightbox.counter", { current: index + 1, total })}
        </span>
        <span className="lightbox-title">{t(item.titleKey)}</span>
        <span className="lightbox-blurb">{t(item.blurbKey)}</span>
      </figcaption>
    </figure>
  );
}
