import { Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
import { tid } from "@/lib/tid";

/** Telegram channel for the reveal — the Furry Colombia community channel. */
const FOLLOW_URL = "https://t.me/furrycolombia";

/** Props for {@link FollowCta}. */
interface FollowCtaProps {
  readonly className?: string;
  /** Analytics section this CTA is attributed to. Defaults to `"teaser"`. */
  readonly contentSection?: string;
}

/** Primary "join the pack" call-to-action linking to the Telegram channel. */
export function FollowCta({
  className,
  contentSection = "teaser",
}: Readonly<FollowCtaProps>) {
  const { t } = useTranslation();
  return (
    <a
      href={FOLLOW_URL}
      target="_blank"
      rel="noreferrer"
      data-testid={tid("teaser-follow")}
      data-content-section={contentSection}
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
