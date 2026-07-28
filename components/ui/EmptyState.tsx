import type { ReactNode } from "react";
import { cn } from "@/lib/ui/cn";
import { RayBurst } from "./Rays";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 px-8 py-12 text-center",
        className,
      )}
    >
      {icon ?? <RayBurst size={88} className="mb-1" />}
      <h3 className="font-display text-h3 font-semibold text-ink">{title}</h3>
      {description && (
        <p className="max-w-[32ch] font-sans text-body leading-relaxed text-ink-muted">
          {description}
        </p>
      )}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
