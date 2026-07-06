import { useId } from "react";

/** Decorative crescent moon rendered inline so high-contrast/forced-colors modes keep it visible. */
export function CrescentMoon({
  className,
  style,
}: Readonly<{
  className?: string;
  style?: React.CSSProperties;
}>) {
  const maskId = useId();

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 500 500"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <defs>
        <mask id={maskId}>
          <rect width="500" height="500" fill="#000" />
          <circle cx="250" cy="250" r="220" fill="#fff" />
          <circle cx="285" cy="238" r="190" fill="#000" />
        </mask>
      </defs>
      <rect
        className="decorative-moon"
        width="500"
        height="500"
        fill="currentColor"
        mask={`url(#${maskId})`}
      />
    </svg>
  );
}
