/** Props for {@link InfoCard}. */
interface InfoCardProps {
  readonly icon: string;
  readonly title: string;
  readonly description: string;
}

/** Icon + title + description card used for activities and travel tips. */
export function InfoCard({
  icon,
  title,
  description,
}: Readonly<InfoCardProps>) {
  return (
    <article className="card">
      <span className="card-icon" aria-hidden="true">
        {icon}
      </span>
      <h3 className="card-title">{title}</h3>
      <p className="card-desc">{description}</p>
    </article>
  );
}
