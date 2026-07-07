/** Props for {@link WaxPalm}. */
interface WaxPalmProps {
  readonly className?: string;
  readonly src: string;
}

/**
 * A decorative palm — one of four CC0 palm illustrations recolored to the
 * carnaval palette (teal fronds, cream trunk). `src` selects which palm.
 */
export function WaxPalm({ className, src }: Readonly<WaxPalmProps>) {
  return (
    <img
      className={className}
      src={src}
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
    />
  );
}
