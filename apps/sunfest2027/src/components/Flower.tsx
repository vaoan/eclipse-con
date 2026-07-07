/** Props for {@link Flower}. */
interface FlowerProps {
  readonly className?: string;
  readonly color?: string;
}

/**
 * A stylized Cattleya orchid — Colombia's national flower: two showy upper
 * petals, lower sepals, and the signature ruffled lip with a yellow throat.
 */
export function Flower({
  className,
  color = "var(--color-magenta)",
}: Readonly<FlowerProps>) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 104"
      role="presentation"
      aria-hidden="true"
    >
      <g fill={color}>
        {/* dorsal sepal (top) */}
        <ellipse cx="50" cy="22" rx="9" ry="19" />
        {/* showy upper petals */}
        <ellipse
          cx="27"
          cy="33"
          rx="19"
          ry="13"
          transform="rotate(-22 27 33)"
        />
        <ellipse cx="73" cy="33" rx="19" ry="13" transform="rotate(22 73 33)" />
        {/* lower lateral sepals */}
        <ellipse cx="33" cy="58" rx="8" ry="17" transform="rotate(30 33 58)" />
        <ellipse cx="67" cy="58" rx="8" ry="17" transform="rotate(-30 67 58)" />
        {/* labellum / lip (ruffled trumpet) */}
        <path d="M50 44 C29 47 25 76 41 90 C46 95 54 95 59 90 C75 76 71 47 50 44 Z" />
      </g>
      {/* yellow throat */}
      <ellipse cx="50" cy="60" rx="9" ry="12" fill="var(--color-yellow)" />
      {/* column */}
      <ellipse cx="50" cy="46" rx="4.5" ry="7" fill="var(--color-cream)" />
    </svg>
  );
}
