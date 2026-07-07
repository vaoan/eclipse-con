/** Props for {@link OrganizerCard}. */
interface OrganizerCardProps {
  readonly initials: string;
  readonly name: string;
  readonly role: string;
  readonly bio: string;
}

/** Organizer card with an initials avatar, name, role, and short bio. */
export function OrganizerCard({
  initials,
  name,
  role,
  bio,
}: Readonly<OrganizerCardProps>) {
  return (
    <article className="org-card">
      <span className="org-avatar" aria-hidden="true">
        {initials}
      </span>
      <h3 className="org-name">{name}</h3>
      <p className="org-role">{role}</p>
      <p className="org-bio">{bio}</p>
    </article>
  );
}
