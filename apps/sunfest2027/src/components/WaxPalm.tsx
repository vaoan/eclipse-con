/** Props for {@link WaxPalm}. */
interface WaxPalmProps {
  readonly className?: string;
}

/**
 * A stylized palm (palma de cera del Quindío), from a CC0 palm illustration
 * recolored to the carnaval palette and stretched tall + thin like the real
 * wax palm. Rendered as a decorative image.
 */
export function WaxPalm({ className }: Readonly<WaxPalmProps>) {
  return (
    <img
      className={className}
      src="/assets/palm.svg"
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
    />
  );
}
