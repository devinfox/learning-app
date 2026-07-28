import type { HTMLAttributes } from "react";
import { cn } from "@/lib/ui/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevation?: "flat" | "card" | "raised";
  padded?: boolean;
}

export function Card({
  elevation = "card",
  padded = true,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[--radius-card] bg-surface",
        elevation === "flat" && "border border-line",
        elevation === "card" && "shadow-[--shadow-card]",
        elevation === "raised" && "shadow-[--shadow-raised]",
        padded && "p-5",
        className,
      )}
      {...props}
    />
  );
}
