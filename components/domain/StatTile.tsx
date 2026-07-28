import type { ReactNode } from "react";
import { cn } from "@/lib/ui/cn";

export interface StatTileProps {
  icon?: ReactNode;
  value: ReactNode;
  suffix?: ReactNode;
  label: string;
  className?: string;
}

export function StatTile({ icon, value, suffix, label, className }: StatTileProps) {
  return (
    <div
      className={cn(
        "rounded-[--radius-card] bg-surface p-4 shadow-[--shadow-card]",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        {icon && <span className="text-ink" aria-hidden="true">{icon}</span>}
        <span className="font-display text-xl font-bold tabular-nums text-ink">
          {value}
          {suffix && (
            <span className="text-base font-semibold text-ink-subtle">{suffix}</span>
          )}
        </span>
      </div>
      <p className="mt-1.5 text-sm text-ink-muted">{label}</p>
    </div>
  );
}
