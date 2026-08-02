import { Send } from "lucide-react";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/cn";
import { tid } from "@/lib/tid";

/** Telegram channel for the reveal — the Furry Colombia community channel. */
const FOLLOW_URL = "https://t.me/furrycolombia";

/** Props for {@link FollowCta}. */
interface FollowCtaProps {
  readonly className?: string;
  /** Analytics section this CTA is attributed to. Defaults to `"teaser"`. */
  readonly contentSection?: string;
  /** Test id, so multiple instances stay uniquely selectable. */
  readonly testId?: string;
  /** Analytics content id. */
  readonly contentId?: string;
  /** Analytics CTA id. */
  readonly ctaId?: string;
}

/** Primary "join the pack" call-to-action linking to the Telegram channel. */
export function FollowCta({
  className,
  contentSection = "teaser",
  testId = "teaser-follow",
  contentId = "follow_telegram",
  ctaId = "teaser_follow",
}: Readonly<FollowCtaProps>) {
  const { t } = useTranslation();
  return (
    <a
      href={FOLLOW_URL}
      target="_blank"
      rel="noreferrer"
      data-testid={tid(testId)}
      data-content-section={contentSection}
      data-content-id={contentId}
      data-cta-id={ctaId}
      data-funnel-step="follow"
      className={cn("cta", className)}
    >
      <Send className="size-5" aria-hidden="true" />
      {t("teaser.followCta")}
    </a>
  );
}
