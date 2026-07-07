/** Props for {@link WaxPalm}. */
interface WaxPalmProps {
  readonly className?: string;
}

/**
 * A cartoon palma de cera del Quindío (Ceroxylon quindiuense) — Colombia's
 * national tree: a very tall, slender ringed trunk topped by a fountain of
 * arching, drooping fronds and a small fruit cluster.
 */
export function WaxPalm({ className }: Readonly<WaxPalmProps>) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 300"
      role="presentation"
      aria-hidden="true"
      preserveAspectRatio="xMidYMax meet"
    >
      {/* trunk */}
      <path d="M54 300 L58 64 L62 64 L66 300 Z" fill="var(--color-cream)" />
      {/* trunk rings (leaf scars) */}
      <ellipse
        cx="60"
        cy="270"
        rx="6.6"
        ry="2"
        fill="var(--color-ink)"
        opacity="0.2"
      />
      <ellipse
        cx="60"
        cy="222"
        rx="6.1"
        ry="1.9"
        fill="var(--color-ink)"
        opacity="0.17"
      />
      <ellipse
        cx="60"
        cy="176"
        rx="5.6"
        ry="1.8"
        fill="var(--color-ink)"
        opacity="0.15"
      />
      <ellipse
        cx="60"
        cy="132"
        rx="5.1"
        ry="1.7"
        fill="var(--color-ink)"
        opacity="0.13"
      />
      <ellipse
        cx="60"
        cy="94"
        rx="4.7"
        ry="1.6"
        fill="var(--color-ink)"
        opacity="0.12"
      />
      {/* crownshaft bulge */}
      <ellipse cx="60" cy="64" rx="6" ry="9" fill="var(--color-teal-soft)" />
      {/* fronds — an arching fountain, mirrored left/right */}
      <g transform="translate(60 60)" fill="var(--color-teal)">
        <path d="M0 0 Q2 -30 0 -58 Q-2 -30 0 0 Z" />
        <g>
          <path d="M0 0 Q11 -30 8 -54 Q0 -30 0 0 Z" />
          <path d="M0 0 Q22 -30 34 -14 Q12 -24 0 0 Z" />
          <path d="M0 0 Q30 -18 50 0 Q26 -12 0 0 Z" />
          <path d="M0 0 Q30 -6 48 12 Q24 -4 0 0 Z" />
        </g>
        <g transform="scale(-1 1)">
          <path d="M0 0 Q11 -30 8 -54 Q0 -30 0 0 Z" />
          <path d="M0 0 Q22 -30 34 -14 Q12 -24 0 0 Z" />
          <path d="M0 0 Q30 -18 50 0 Q26 -12 0 0 Z" />
          <path d="M0 0 Q30 -6 48 12 Q24 -4 0 0 Z" />
        </g>
      </g>
      {/* fruit cluster */}
      <circle cx="60" cy="68" r="3" fill="var(--color-yellow)" />
      <circle cx="55" cy="70" r="2" fill="var(--color-yellow)" />
      <circle cx="65" cy="70" r="2" fill="var(--color-yellow)" />
    </svg>
  );
}
