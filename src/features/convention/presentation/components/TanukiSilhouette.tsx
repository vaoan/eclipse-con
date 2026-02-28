import { cn } from "@/shared/application/utils/cn";

interface TanukiSilhouetteProps {
  readonly className?: string;
}

const SVG_MARKUP = `<g id="g18726" transform="matrix(1.3333333,0,0,-1.3333333,0,800)"> <g id="g18728"> <g id="g18730"></g> </g> </g>`;

/** Decorative SVG silhouette of a tanuki (raccoon dog) for atmospheric decoration. */
export function TanukiSilhouette({
  className,
}: Readonly<TanukiSilhouetteProps>) {
  return (
    <svg
      className={cn("h-auto w-full", className)}
      aria-hidden="true"
      viewBox="0 0 800 800"
      fill="currentColor"
      stroke="currentColor"
      strokeOpacity="0.25"
      strokeWidth="0.5"
      strokeLinejoin="round"
    >
      <g dangerouslySetInnerHTML={{ __html: SVG_MARKUP }} />
    </svg>
  );
}
