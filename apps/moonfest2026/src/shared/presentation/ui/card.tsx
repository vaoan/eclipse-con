import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utilities";

const cardVariants = cva(
  "bg-card text-card-foreground flex flex-col gap-6 rounded-3xl border py-6 shadow-sm",
  {
    variants: {
      variant: {
        default: "",
        polaroid:
          "relative overflow-visible border-[5px] border-white/70 bg-surface/90 text-foreground shadow-[0_20px_50px_-35px_rgba(0,0,0,0.6)] before:pointer-events-none before:absolute before:-left-2 before:top-4 before:h-4 before:w-14 before:rotate-[-6deg] before:rounded-md before:bg-[linear-gradient(135deg,rgba(201,168,76,0.16),rgba(255,255,255,0.4))] before:shadow-[0_6px_16px_rgba(0,0,0,0.2)] after:pointer-events-none after:absolute after:-right-3 after:bottom-10 after:h-5 after:w-16 after:rotate-[4deg] after:rounded-md after:bg-[linear-gradient(135deg,rgba(255,255,255,0.5),rgba(201,168,76,0.1))] after:shadow-[0_6px_16px_rgba(0,0,0,0.18)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Card({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof cardVariants>) {
  return (
    <div
      data-slot="card"
      data-variant={variant ?? "default"}
      className={cn(cardVariants({ variant }), className)}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
