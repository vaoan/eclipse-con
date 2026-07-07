/** Props for {@link SectionHeader}. */
interface SectionHeaderProps {
  readonly title: string;
  readonly subtitle?: string;
}

/** Centered section heading with an optional subtitle. */
export function SectionHeader({
  title,
  subtitle,
}: Readonly<SectionHeaderProps>) {
  return (
    <header className="sec-head">
      <h2 className="sec-title">{title}</h2>
      {subtitle ? <p className="sec-sub">{subtitle}</p> : null}
    </header>
  );
}
