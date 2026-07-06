import { Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
import { tid } from "@/lib/tid";

/** Telegram follow URL for notifications. Placeholder — update to the sunfest channel before launch. */
const FOLLOW_URL = "https://t.me/FurryMoonfest";

/** Props for {@link FollowCta}. */
interface FollowCtaProps {
  readonly className?: string;
}

/** Primary "join the pack" call-to-action linking to the Telegram channel. */
export function FollowCta({ className }: Readonly<FollowCtaProps>) {
  const { t } = useTranslation();
  return (
    <a
      href={FOLLOW_URL}
      target="_blank"
      rel="noreferrer"
      data-testid={tid("teaser-follow")}
      data-content-section="teaser"
      data-content-id="follow_telegram"
      data-cta-id="teaser_follow"
      data-funnel-step="follow"
      className={cn("cta", className)}
    >
      <Send className="size-5" aria-hidden="true" />
      {t("teaser.followCta")}
    </a>
  );
}
