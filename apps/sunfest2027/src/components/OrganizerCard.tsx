import { tid } from "@/lib/tid";

/** Props for {@link OrganizerCard}. */
interface OrganizerCardProps {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly bio: string;
  readonly image: string;
  readonly initials: string;
}

/**
 * Organizer card with a photo, name, role, and short bio. Ported from
 * moonfest's GuestCard; the initials sit behind the photo as a fallback.
 */
export function OrganizerCard({
  id,
  name,
  role,
  bio,
  image,
  initials,
}: Readonly<OrganizerCardProps>) {
  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-surface pb-6 text-left shadow-[0_18px_45px_-30px_rgba(15,23,42,0.9)] transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:bg-surface-elevated"
      data-content-section="organizers"
      data-content-id={`organizer_${id}`}
      data-testid={tid(`organizer-card-${id}`)}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(200,54,140,0.14),_transparent_55%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-accent/50 to-transparent opacity-60" />
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[linear-gradient(135deg,rgba(115,52,166,0.4),rgba(30,12,58,0.94))]">
        <span
          className="absolute inset-0 grid place-items-center font-display text-4xl font-bold text-foreground/50"
          aria-hidden="true"
        >
          {initials}
        </span>
        <img
          src={image}
          alt={name}
          className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="relative border-b border-white/10 px-6 pb-4 pt-5">
        <h3 className="font-display text-xl font-semibold text-foreground">
          {name}
        </h3>
        <p className="mt-1 text-sm font-medium text-accent">{role}</p>
      </div>
      <div className="relative px-6 pt-4">
        <p className="text-sm leading-relaxed text-muted-foreground">{bio}</p>
      </div>
    </article>
  );
}
