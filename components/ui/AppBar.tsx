import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/ui/cn";

export interface AppBarProps {
  title?: ReactNode;
  onBack?: () => void;
  backLabel?: string;
  actions?: ReactNode;
  tone?: "paper" | "cosmos";
  size?: "compact" | "large";
  className?: string;
}

export function AppBar({
  title,
  onBack,
  backLabel = "Back",
  actions,
  tone = "paper",
  size = "compact",
  className,
}: AppBarProps) {
  const dark = tone === "cosmos";

  return (
    <header
      className={cn(
        "sticky top-0 z-30 pt-safe",
        dark ? "bg-cosmos text-white" : "bg-ground/85 text-ink backdrop-blur-md",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2 px-4",
          size === "large" ? "h-auto pt-2 pb-4" : "h-14",
        )}
      >
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label={backLabel}
            className={cn(
              "-ml-2 grid size-10 shrink-0 place-items-center rounded-full transition",
              dark ? "hover:bg-white/10" : "hover:bg-surface-sunken",
            )}
          >
            <ChevronLeft size={24} strokeWidth={2.25} />
          </button>
        )}

        {title &&
          (size === "large" ? (
            <h1 className="font-display text-[1.75rem] font-bold leading-tight">
              {title}
            </h1>
          ) : (
            <h1 className="truncate font-display text-xl font-semibold">{title}</h1>
          ))}

        {actions && <div className="ml-auto flex items-center gap-1">{actions}</div>}
      </div>
    </header>
  );
}
