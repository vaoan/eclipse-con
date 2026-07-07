import { cn } from "@/lib/cn";

/** Props for {@link SectionHeader}. */
interface SectionHeaderProps {
  readonly title: string;
  readonly eyebrow?: string;
  readonly subtitle?: string;
  readonly align?: "left" | "center";
  readonly titleClassName?: string;
  readonly className?: string;
}

/**
 * Section heading with an optional group eyebrow, title, magenta accent rule,
 * and optional subtitle. Ported from moonfest's SectionHeader.
 */
export function SectionHeader({
  title,
  eyebrow,
  subtitle,
  align = "center",
  titleClassName,
  className,
}: Readonly<SectionHeaderProps>) {
  const isCenter = align === "center";

  return (
    <div className={cn(isCenter ? "text-center" : "text-left", className)}>
      {eyebrow ? (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-accent">
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          "font-display text-4xl font-bold text-foreground md:text-5xl",
          titleClassName
        )}
      >
        {title}
      </h2>
      <div
        className={cn(
          "mt-4 h-1 w-16 rounded-full bg-accent",
          isCenter && "mx-auto"
        )}
        aria-hidden="true"
      />
      {subtitle ? (
        <p
          className={cn(
            "mt-4 text-muted-foreground",
            isCenter && "mx-auto max-w-lg"
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
