import { Check, Play, RotateCw } from "lucide-react";
import { ProgressBar } from "@/components/ui/Progress";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/ui/cn";

export interface ChapterRowProps {
  order: number;
  title: string;
  percent: number;
  completed?: boolean;
  lessonStatus?: "pending" | "generating" | "ready" | "failed";
  onStart?: () => void;
  onRetry?: () => void;
  showConnector?: boolean;
  className?: string;
}

export function ChapterRow({
  order,
  title,
  percent,
  completed,
  lessonStatus = "pending",
  onStart,
  onRetry,
  showConnector = true,
  className,
}: ChapterRowProps) {
  const generating = lessonStatus === "generating";
  const failed = lessonStatus === "failed";

  return (
    <div className={cn("relative flex gap-3", className)}>
      {showConnector && (
        <span
          aria-hidden="true"
          className="absolute left-[1.375rem] top-11 bottom-0 w-px bg-line-strong"
        />
      )}

      <span
        className={cn(
          "relative z-10 grid size-11 shrink-0 place-items-center rounded-full",
          "font-display text-sm font-bold tabular-nums",
          completed ? "bg-lumen text-cosmos" : "bg-cosmos text-white",
        )}
      >
        {completed ? <Check size={18} strokeWidth={3} aria-hidden="true" /> : String(order).padStart(2, "0")}
      </span>

      <div className="min-w-0 flex-1 rounded-[--radius-card] bg-surface p-3.5 shadow-[--shadow-card]">
        <div className="flex items-center gap-3">
          <h3 className="min-w-0 flex-1 truncate text-[0.9375rem] font-semibold text-ink">
            {title}
          </h3>

          {failed ? (
            <button
              type="button"
              onClick={onRetry}
              aria-label={`Retry generating ${title}`}
              className="grid size-10 shrink-0 place-items-center rounded-full bg-surface-sunken text-ink-muted hover:bg-line"
            >
              <RotateCw size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={onStart}
              disabled={generating}
              aria-label={
                percent > 0 && !completed ? `Resume ${title}` : `Start ${title}`
              }
              className={cn(
                "grid size-10 shrink-0 place-items-center rounded-full transition",
                "bg-lumen text-cosmos hover:bg-lumen-deep active:scale-95",
                "disabled:opacity-60",
              )}
            >
              {generating ? (
                <Spinner size={18} />
              ) : (
                <Play size={17} fill="currentColor" aria-hidden="true" />
              )}
            </button>
          )}
        </div>

        <ProgressBar
          value={percent}
          className="mt-3"
          label={`${title} progress`}
        />
      </div>
    </div>
  );
}
