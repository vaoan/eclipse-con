import { Separator } from "@/components/ui/separator";
import { cn } from "@/shared/application/utils/cn";

interface SectionHeaderProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly align?: "left" | "center";
  readonly titleClassName?: string;
  readonly accent?: "default" | "gold" | "red" | "green";
  readonly className?: string;
}

const ACCENT_STYLES = {
  default: {
    bar: "bg-accent",
  },
  gold: {
    bar: "bg-amber-400",
  },
  red: {
    bar: "bg-rose-400",
  },
  green: {
    bar: "bg-amber-400",
  },
} as const;

/** Renders a section heading with a title, decorative accent bar, and optional subtitle. */
export function SectionHeader({
  title,
  subtitle,
  align = "center",
  titleClassName,
  accent = "default",
  className,
}: Readonly<SectionHeaderProps>) {
  const isCenter = align === "center";
  const accentStyle = ACCENT_STYLES[accent];

  return (
    <div className={cn(isCenter ? "text-center" : "text-left", className)}>
      <h2
        className={cn(
          "font-display text-4xl font-bold text-foreground md:text-5xl",
          titleClassName
        )}
      >
        {title}
      </h2>
      <Separator
        className={cn(
          "mt-4 h-1 w-16 rounded-full",
          accentStyle.bar,
          isCenter && "mx-auto"
        )}
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
