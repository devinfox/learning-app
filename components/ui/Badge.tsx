import type { ReactNode } from "react";
import { cn } from "@/lib/ui/cn";

export type BadgeTone = "new" | "neutral" | "success" | "warning" | "brand";

const TONES: Record<BadgeTone, string> = {
  new: "bg-lumen text-cosmos",
  neutral: "bg-surface-sunken text-ink-muted",
  success: "bg-verdant/20 text-verdant-ink",
  warning: "bg-ember/15 text-ember-ink",
  brand: "bg-accent-soft text-brand",
};

export interface BadgeProps {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}

export function Badge({ tone = "neutral", className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1",
        "text-[0.6875rem] font-semibold leading-none tracking-wide",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
