import { cn } from "@/shared/application/utils/cn";

interface SectionHeaderProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly align?: "left" | "center";
  readonly className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  align = "center",
  className,
}: Readonly<SectionHeaderProps>) {
  const isCenter = align === "center";

  return (
    <div className={cn(isCenter ? "text-center" : "text-left", className)}>
      <h2 className="font-display text-4xl font-bold text-foreground md:text-5xl">
        {title}
      </h2>
      <div
        className={cn(
          "mt-4 h-1 w-16 rounded-full bg-accent",
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
