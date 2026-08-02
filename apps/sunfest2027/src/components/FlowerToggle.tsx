import { Flower2 } from "lucide-react";
import { useTranslation } from "@/i18n";
import { setFlowerShower, useFlowerShower } from "@/lib/useFlowerShower";
import { tid } from "@/lib/tid";

/** Corner toggle that turns the ambient falling-flower shower on or off. */
export function FlowerToggle() {
  const { t } = useTranslation();
  const on = useFlowerShower();
  return (
    <button
      type="button"
      className="flower-toggle"
      aria-pressed={on}
      aria-label={t("teaser.flowerShower")}
      title={t("teaser.flowerShower")}
      data-on={on}
      onClick={() => {
        setFlowerShower(!on);
      }}
      data-content-section="navigation"
      data-content-id="flower_shower"
      data-content-interaction={on ? "collapse" : "expand"}
      data-testid={tid("flower-toggle")}
    >
      <Flower2 className="size-5" aria-hidden="true" />
    </button>
  );
}
