/** Props for {@link Marimonda}. */
interface MarimondaProps {
  readonly className?: string;
}

/**
 * The marimonda — Barranquilla Carnival's signature masked figure: round eyes,
 * long dangling trunk-nose, and floppy ears, in the Sunfest palette.
 */
export function Marimonda({ className }: Readonly<MarimondaProps>) {
  return (
    <svg
      className={className}
      viewBox="0 0 140 172"
      fill="none"
      role="presentation"
      aria-hidden="true"
    >
      {/* floppy ears */}
      <ellipse
        cx="22"
        cy="60"
        rx="17"
        ry="27"
        fill="var(--color-magenta)"
        transform="rotate(-20 22 60)"
      />
      <ellipse
        cx="118"
        cy="60"
        rx="17"
        ry="27"
        fill="var(--color-magenta)"
        transform="rotate(20 118 60)"
      />
      {/* head */}
      <circle cx="70" cy="58" r="45" fill="var(--color-purple)" />
      {/* eyes */}
      <circle cx="51" cy="52" r="16.5" fill="var(--color-cream)" />
      <circle cx="89" cy="52" r="16.5" fill="var(--color-cream)" />
      <circle cx="51" cy="54" r="7" fill="var(--color-ink)" />
      <circle cx="89" cy="54" r="7" fill="var(--color-ink)" />
      {/* trunk-nose */}
      <path
        d="M70 66 q-11 32 5 54 q8 12 -4 34"
        stroke="var(--color-yellow)"
        strokeWidth="16"
        strokeLinecap="round"
      />
      {/* trunk tip */}
      <circle cx="63" cy="156" r="9" fill="var(--color-teal)" />
    </svg>
  );
}
