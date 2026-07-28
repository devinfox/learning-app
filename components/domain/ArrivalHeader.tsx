import type { ReactNode } from "react";
import { LogoMark } from "@/components/ui/Logo";
import { cn } from "@/lib/ui/cn";

export interface ArrivalHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  highlight?: ReactNode;
  className?: string;
}

export function ArrivalHeader({
  title,
  subtitle,
  highlight,
  className,
}: ArrivalHeaderProps) {
  return (
    <header className={cn("flex flex-col items-center gap-3 px-6 text-center", className)}>
      <LogoMark size={44} />

      <h1 className="font-display text-display font-bold text-ink">{title}</h1>

      {subtitle && (
        <p className="max-w-[34ch] font-sans text-body leading-relaxed text-ink-muted">
          {subtitle}
        </p>
      )}

      {highlight && (
        <p className="mt-1 rounded-full bg-lumen px-4 py-1.5 font-sans text-sm font-semibold text-cosmos">
          {highlight}
        </p>
      )}
    </header>
  );
}
