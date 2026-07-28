import type { ReactNode } from "react";
import { cn } from "@/lib/ui/cn";
import { PrismGlow } from "./Rays";

export interface ScreenProps {
  children: ReactNode;
  hasBottomNav?: boolean;
  ground?: "paper" | "cosmos";
  wash?: boolean;
  className?: string;
  contentClassName?: string;
}

export function Screen({
  children,
  hasBottomNav = false,
  ground = "paper",
  wash = false,
  className,
  contentClassName,
}: ScreenProps) {
  const cosmos = ground === "cosmos";

  return (
    <div
      data-ground={cosmos ? "cosmos" : undefined}
      className={cn(
        "relative flex min-h-dvh flex-col",
        cosmos ? "bg-cosmos" : "bg-paper",
        className,
      )}
    >
      {cosmos ? (
        <PrismGlow />
      ) : (
        wash && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-aura via-aura/40 to-transparent"
          />
        )
      )}

      <div
        className={cn(
          "relative flex flex-1 flex-col",
          hasBottomNav && "pb-[calc(5.5rem+var(--safe-bottom))]",
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}

export interface SectionProps {
  title?: ReactNode;
  action?: ReactNode;
  ruled?: boolean;
  children: ReactNode;
  className?: string;
}

export function Section({ title, action, ruled, children, className }: SectionProps) {
  return (
    <section className={cn("space-y-3", className)}>
      {(title || action) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            {title && (
              <h2 className="font-sans text-sm font-semibold tracking-wide text-ink-muted">
                {title}
              </h2>
            )}
            {action}
          </div>
          {ruled && <span className="block h-[3px] w-16 rounded-full bg-spectrum" />}
        </div>
      )}
      {children}
    </section>
  );
}
