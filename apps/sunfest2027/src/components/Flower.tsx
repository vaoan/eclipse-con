/** Number of distinct Colombian flower shapes available. */
export const FLOWER_VARIANTS = 4;

/** Props for {@link Flower}. */
interface FlowerProps {
  readonly variant?: number;
  readonly color?: string;
  readonly className?: string;
}

const PENTAGON = [0, 72, 144, 216, 288] as const;
const TRIAD = [0, 120, 240] as const;

/** The inner SVG shapes for one Colombian flower variant. */
function shapes(variant: number, color: string) {
  switch (variant % FLOWER_VARIANTS) {
    case 1: // Veranera (bougainvillea): three papery bracts + tiny white flowers
      return (
        <>
          <g fill={color}>
            {TRIAD.map((angle) => (
              <path
                key={angle}
                d="M50 50 C34 42 34 15 50 9 C66 15 66 42 50 50 Z"
                transform={`rotate(${angle} 50 50)`}
              />
            ))}
          </g>
          <circle cx="46" cy="48" r="3" fill="var(--color-cream)" />
          <circle cx="54" cy="48" r="3" fill="var(--color-cream)" />
          <circle cx="50" cy="55" r="3" fill="var(--color-cream)" />
        </>
      );
    case 2: // Flor de café (coffee blossom): five slim petals + center
      return (
        <>
          <g fill={color}>
            {PENTAGON.map((angle) => (
              <ellipse
                key={angle}
                cx="50"
                cy="24"
                rx="7"
                ry="22"
                transform={`rotate(${angle} 50 50)`}
              />
            ))}
          </g>
          <circle cx="50" cy="50" r="9" fill="var(--color-yellow)" />
        </>
      );
    case 3: // Guayacán (trumpet flower): five broad lobes + throat
      return (
        <>
          <g fill={color}>
            {PENTAGON.map((angle) => (
              <ellipse
                key={angle}
                cx="50"
                cy="28"
                rx="13"
                ry="21"
                transform={`rotate(${angle} 50 50)`}
              />
            ))}
          </g>
          <circle cx="50" cy="50" r="13" fill="var(--color-yellow)" />
          <circle cx="50" cy="50" r="5" fill={color} />
        </>
      );
    default: // Orquídea (Cattleya) — Colombia's national flower
      return (
        <>
          <g fill={color}>
            <ellipse cx="50" cy="22" rx="9" ry="19" />
            <ellipse
              cx="27"
              cy="33"
              rx="19"
              ry="13"
              transform="rotate(-22 27 33)"
            />
            <ellipse
              cx="73"
              cy="33"
              rx="19"
              ry="13"
              transform="rotate(22 73 33)"
            />
            <ellipse
              cx="33"
              cy="58"
              rx="8"
              ry="17"
              transform="rotate(30 33 58)"
            />
            <ellipse
              cx="67"
              cy="58"
              rx="8"
              ry="17"
              transform="rotate(-30 67 58)"
            />
            <path d="M50 44 C29 47 25 76 41 90 C46 95 54 95 59 90 C75 76 71 47 50 44 Z" />
          </g>
          <ellipse cx="50" cy="60" rx="9" ry="12" fill="var(--color-yellow)" />
          <ellipse cx="50" cy="46" rx="4.5" ry="7" fill="var(--color-cream)" />
        </>
      );
  }
}

/**
 * A stylized Colombian flower — orquídea (Cattleya), veranera, flor de café,
 * or guayacán — selected by `variant`.
 */
export function Flower({
  variant = 0,
  color = "var(--color-magenta)",
  className,
}: Readonly<FlowerProps>) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 104"
      role="presentation"
      aria-hidden="true"
    >
      {shapes(variant, color)}
    </svg>
  );
}
