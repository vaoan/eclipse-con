import { tid } from "@/lib/tid";

/** Props for {@link ActivityCard}. */
interface ActivityCardProps {
  readonly id: string;
  readonly title: string;
  readonly description: string;
}

/**
 * Card for a single activity. Ported from moonfest's EventCard; the lucide
 * icon is replaced with a clean magenta accent mark (sunfest has no lucide).
 */
export function ActivityCard({
  id,
  title,
  description,
}: Readonly<ActivityCardProps>) {
  return (
    <article
      className="group rounded-2xl border border-white/5 bg-surface/90 transition-all duration-300 hover:border-accent/30 hover:bg-surface-elevated"
      data-content-section="activities"
      data-content-id={`activity_${id}`}
      data-testid={tid(`activity-card-${id}`)}
    >
      <div className="flex items-center gap-4 border-b border-white/5 p-5 pb-4">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/15 transition-colors group-hover:bg-accent/25"
          aria-hidden="true"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-accent" />
        </span>
        <h3 className="font-display text-base font-bold text-foreground">
          {title}
        </h3>
      </div>
      <div className="p-5 pt-4">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </article>
  );
}
