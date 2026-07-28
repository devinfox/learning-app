import { Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/ui/cn";
import { subjectIcon } from "./SubjectTile";

export interface CourseCardProps {
  subjectName: string;
  subjectIconName?: string;
  currentTopic?: string | null;
  status?: "ready" | "generating" | "failed" | "awaiting_placement";
  onStartLesson?: () => void;
  onLearnWithAi?: () => void;
  onTakePlacement?: () => void;
  onRetry?: () => void;
  className?: string;
}

export function CourseCard({
  subjectName,
  subjectIconName,
  currentTopic,
  status = "ready",
  onStartLesson,
  onLearnWithAi,
  onTakePlacement,
  onRetry,
  className,
}: CourseCardProps) {
  const Icon = subjectIcon(subjectIconName);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[--radius-card] bg-surface p-5 shadow-[--shadow-card]",
        className,
      )}
    >
      <Icon
        size={104}
        strokeWidth={1.2}
        aria-hidden="true"
        className="pointer-events-none absolute -right-4 top-2 text-ink/[0.06]"
      />

      <p className="text-xs font-medium tracking-wide text-ink-subtle uppercase">
        Subject
      </p>
      <h3 className="mt-1 font-display text-2xl font-bold text-ink">{subjectName}</h3>

      <div className="mt-4 min-h-[3.25rem]">
        {status === "generating" ? (
          <>
            <p className="text-sm text-ink-muted">Preparing your syllabus…</p>
            <Skeleton className="mt-2 h-4 w-3/4" />
          </>
        ) : status === "failed" ? (
          <p className="text-sm text-ember-ink">
            We couldn&apos;t build your syllabus. Try again.
          </p>
        ) : status === "awaiting_placement" ? (
          <p className="text-sm text-ink-muted">
            Take a short placement check so we can pitch this at the right level.
          </p>
        ) : (
          <>
            <p className="text-sm font-medium text-ink-muted">Current topic:</p>
            <p className="mt-0.5 text-[0.9375rem] text-ink">{currentTopic}</p>
          </>
        )}
      </div>

      <div className="mt-5 space-y-2.5">
        {status === "awaiting_placement" ? (
          <Button fullWidth onClick={onTakePlacement} leadingIcon={<Sparkles size={18} />}>
            Take Placement Check
          </Button>
        ) : status === "failed" ? (
          <Button fullWidth variant="secondary" onClick={onRetry}>
            Retry
          </Button>
        ) : (
          <Button fullWidth onClick={onStartLesson} disabled={status === "generating"}>
            Start Today&apos;s Lesson
          </Button>
        )}

        <Button
          fullWidth
          variant="secondary"
          onClick={onLearnWithAi}
          leadingIcon={<Bot size={18} />}
        >
          Learn through AI
        </Button>
      </div>
    </div>
  );
}
