import { useTranslation } from "react-i18next";
import type { Amenity } from "@/showcase";
import { tid } from "@/lib/tid";

/** Props for {@link AmenityCard}. */
interface AmenityCardProps {
  readonly item: Amenity;
  readonly onOpen: () => void;
}

/** A venue amenity: photo, accent icon, label and one-line description; opens the lightbox. */
export function AmenityCard({ item, onOpen }: Readonly<AmenityCardProps>) {
  const { t } = useTranslation();
  const { icon: Icon } = item;
  return (
    <button
      type="button"
      className="amenity-card"
      style={{ ["--card-accent" as string]: item.color }}
      onClick={onOpen}
      aria-label={t("showcase.openItem", { title: t(item.titleKey) })}
      data-testid={tid(`amenity-${item.id}`)}
      data-content-section="amenities"
      data-content-id={`open_${item.id}`}
      data-content-interaction="open"
    >
      <img
        src={item.thumb}
        alt=""
        loading="lazy"
        decoding="async"
        className="amenity-card-img"
      />
      <span className="amenity-card-body">
        <span className="amenity-card-head">
          <Icon className="amenity-card-icon" aria-hidden="true" />
          <span className="amenity-card-label">{t(item.titleKey)}</span>
        </span>
        <span className="amenity-card-desc">{t(item.blurbKey)}</span>
      </span>
    </button>
  );
}
