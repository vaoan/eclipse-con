import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

/** Decorative "scroll for more" cue shown at the bottom of the hero. */
export function ScrollCue() {
  const { t } = useTranslation();
  return (
    <span className="scroll-cue" aria-hidden="true">
      {t("teaser.scrollCue")}
      <ChevronDown className="size-4" />
    </span>
  );
}
