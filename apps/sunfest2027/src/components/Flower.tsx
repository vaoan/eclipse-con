/** Props for {@link Flower}. */
interface FlowerProps {
  readonly className?: string;
  readonly color?: string;
}

/** A stylized carnaval flower — the blooms that smother Congo turbans. */
export function Flower({
  className,
  color = "var(--color-yellow)",
}: Readonly<FlowerProps>) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      role="presentation"
      aria-hidden="true"
    >
      <g fill={color}>
        <ellipse cx="50" cy="22" rx="13" ry="24" />
        <ellipse cx="50" cy="22" rx="13" ry="24" transform="rotate(60 50 50)" />
        <ellipse
          cx="50"
          cy="22"
          rx="13"
          ry="24"
          transform="rotate(120 50 50)"
        />
        <ellipse
          cx="50"
          cy="22"
          rx="13"
          ry="24"
          transform="rotate(180 50 50)"
        />
        <ellipse
          cx="50"
          cy="22"
          rx="13"
          ry="24"
          transform="rotate(240 50 50)"
        />
        <ellipse
          cx="50"
          cy="22"
          rx="13"
          ry="24"
          transform="rotate(300 50 50)"
        />
      </g>
      <circle cx="50" cy="50" r="14" fill="var(--color-cream)" />
    </svg>
  );
}
