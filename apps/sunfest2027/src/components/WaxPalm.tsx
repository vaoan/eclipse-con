/** Props for {@link WaxPalm}. */
interface WaxPalmProps {
  readonly className?: string;
}

const FROND_ANGLES = [-80, -54, -27, 0, 27, 54, 80] as const;

/**
 * A stylized palma de cera del Quindío — Colombia's national tree and the
 * icon of the Cocora Valley: a tall pale ringed trunk with a fan of fronds.
 */
export function WaxPalm({ className }: Readonly<WaxPalmProps>) {
  return (
    <svg
      className={className}
      viewBox="0 0 50 170"
      role="presentation"
      aria-hidden="true"
      preserveAspectRatio="xMidYMax meet"
    >
      {/* trunk */}
      <path d="M20 170 L23.5 46 L26.5 46 L30 170 Z" fill="var(--color-cream)" />
      {/* trunk rings */}
      <ellipse
        cx="24"
        cy="150"
        rx="5"
        ry="1.6"
        fill="var(--color-ink)"
        opacity="0.18"
      />
      <ellipse
        cx="24.5"
        cy="118"
        rx="4.6"
        ry="1.5"
        fill="var(--color-ink)"
        opacity="0.15"
      />
      <ellipse
        cx="25"
        cy="86"
        rx="4.2"
        ry="1.4"
        fill="var(--color-ink)"
        opacity="0.13"
      />
      {/* fronds */}
      <g fill="var(--color-teal)">
        {FROND_ANGLES.map((angle) => (
          <ellipse
            key={angle}
            cx="25"
            cy="24"
            rx="4.6"
            ry="24"
            transform={`rotate(${angle} 25 46)`}
          />
        ))}
      </g>
      {/* crown */}
      <circle cx="25.5" cy="46" r="4" fill="var(--color-yellow)" />
    </svg>
  );
}
