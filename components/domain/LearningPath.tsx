"use client";

import { Check, Lock, Play, RotateCw } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/ui/cn";
import type { MasteryTier } from "@/lib/services/mastery";

export interface PathChapter {
  id: string;
  order: number;
  title: string;
  summary: string;
  tier: MasteryTier;
  percent: number;
  completed: boolean;
  lessonId: string | null;
  lessonStatus: "pending" | "generating" | "ready" | "failed";
  unlocked: boolean;
  passedQuiz: boolean;
}

export interface LearningPathProps {
  chapters: PathChapter[];
  currentChapterId: string | null;
  onOpen: (chapter: PathChapter) => void;
  onRetry?: (chapter: PathChapter) => void;
  onRetakeQuiz?: (chapter: PathChapter) => void;
  className?: string;
}

function needsQuizRetake(chapter: PathChapter): boolean {
  return (
    chapter.unlocked &&
    chapter.completed &&
    !chapter.passedQuiz &&
    chapter.lessonStatus === "ready" &&
    chapter.lessonId !== null
  );
}

const RAY_COLORS = [
  "var(--color-ray-1)",
  "var(--color-ray-2)",
  "var(--color-ray-3)",
  "var(--color-ray-4)",
];

const TIER_RAY_COUNT: Record<MasteryTier, number> = {
  dim: 0,
  lit: 1,
  bright: 2,
  radiant: 4,
  prism: 4,
};

function PathNode({
  chapter,
  isCurrent,
}: {
  chapter: PathChapter;
  isCurrent: boolean;
}) {
  const rays = TIER_RAY_COUNT[chapter.tier];
  const reached = chapter.tier !== "dim";

  return (
    <span className="relative grid size-12 shrink-0 place-items-center">
      {rays > 0 && (
        <span aria-hidden="true" className="absolute inset-0">
          {Array.from({ length: rays }).map((_, index) => (
            <span
              key={index}
              className="absolute left-1/2 top-1/2 h-[2.5px] w-3 origin-left rounded-full"
              style={{
                background: RAY_COLORS[index % RAY_COLORS.length],
                transform: `rotate(${-50 + index * 33}deg) translateX(22px)`,
              }}
            />
          ))}
        </span>
      )}

      {chapter.tier === "prism" && (
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-lumen/30 blur-md"
        />
      )}

      <span
        className={cn(
          "relative z-10 grid size-11 place-items-center rounded-full",
          "font-display text-sm font-bold tabular-nums transition-colors",
          chapter.completed
            ? "bg-lumen text-cosmos"
            : reached
              ? "bg-cosmos text-white"
              : "border-2 border-line-strong bg-surface text-ink-subtle",
          isCurrent && "ring-4 ring-brand/25",
        )}
      >
        {chapter.completed ? (
          <Check size={18} strokeWidth={3} aria-hidden="true" />
        ) : (
          String(chapter.order).padStart(2, "0")
        )}
      </span>
    </span>
  );
}

export function LearningPath({
  chapters,
  currentChapterId,
  onOpen,
  onRetry,
  onRetakeQuiz,
  className,
}: LearningPathProps) {
  const currentIndex = chapters.findIndex((c) => c.id === currentChapterId);

  return (
    <ol className={cn("relative space-y-3", className)}>
      {chapters.map((chapter, index) => {
        const isCurrent = chapter.id === currentChapterId;
        const isPast = currentIndex >= 0 && index < currentIndex;
        const isLast = index === chapters.length - 1;
        const generating = chapter.lessonStatus === "generating";
        const failed = chapter.lessonStatus === "failed";
        const retakeable = needsQuizRetake(chapter);
        const previous = index > 0 ? chapters[index - 1] : null;
        const blockedBy = !chapter.unlocked && previous ? previous : null;
        const blockerRetakeable = blockedBy ? needsQuizRetake(blockedBy) : false;

        return (
          <li key={chapter.id} className="relative flex gap-3">
            {!isLast && (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute left-6 top-12 bottom-[-0.75rem] w-[3px] rounded-full",
                  isPast || chapter.completed ? "bg-spectrum" : "bg-line-strong/60",
                )}
              />
            )}

            <PathNode chapter={chapter} isCurrent={isCurrent} />

            <div
              className={cn(
                "min-w-0 flex-1 rounded-[--radius-card] p-4 transition",
                isCurrent
                  ? "bg-surface shadow-[--shadow-raised] ring-1 ring-brand/20"
                  : "bg-surface shadow-[--shadow-card]",
                chapter.tier === "dim" && !isCurrent && "opacity-70",
                !chapter.unlocked && (blockerRetakeable ? "opacity-75" : "opacity-55"),
              )}
            >
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  {isCurrent && (
                    <p className="mb-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-brand">
                      Up next
                    </p>
                  )}
                  <h3 className="text-[0.9375rem] font-semibold text-ink">
                    {chapter.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-caption text-ink-muted">
                    {chapter.summary}
                  </p>
                  {!chapter.unlocked &&
                    (blockerRetakeable && blockedBy ? (
                      <button
                        type="button"
                        onClick={() => onRetakeQuiz?.(blockedBy)}
                        className={cn(
                          "mt-2 inline-flex items-center gap-1.5 text-caption font-semibold",
                          "text-ink underline decoration-line-strong underline-offset-4",
                          "transition hover:decoration-ink",
                        )}
                      >
                        <RotateCw size={13} aria-hidden="true" />
                        Retake the {blockedBy.title} quiz to unlock
                      </button>
                    ) : (
                      <p className="mt-2 text-caption font-medium text-ink-subtle">
                        {blockedBy
                          ? `Pass the ${blockedBy.title} quiz to unlock`
                          : "Pass the previous quiz to unlock"}
                      </p>
                    ))}

                  {retakeable && (
                    <button
                      type="button"
                      onClick={() => onRetakeQuiz?.(chapter)}
                      className={cn(
                        "mt-2 inline-flex items-center gap-1.5 rounded-full",
                        "bg-surface-sunken px-3 py-1.5 text-caption font-semibold text-ink",
                        "transition hover:bg-line active:scale-95",
                      )}
                    >
                      <RotateCw size={13} aria-hidden="true" />
                      Retake the quiz to unlock the next lesson
                    </button>
                  )}
                </div>

                {!chapter.unlocked ? (
                  <span
                    aria-label="Locked until you pass the previous quiz"
                    title="Pass the previous lesson's quiz to unlock this"
                    className="grid size-11 shrink-0 place-items-center rounded-full bg-surface-sunken text-ink-subtle"
                  >
                    <Lock size={17} aria-hidden="true" />
                  </span>
                ) : failed ? (
                  <button
                    type="button"
                    onClick={() => onRetry?.(chapter)}
                    aria-label={`Retry preparing ${chapter.title}`}
                    className="grid size-11 shrink-0 place-items-center rounded-full bg-surface-sunken text-ink-muted transition hover:bg-line"
                  >
                    <RotateCw size={18} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onOpen(chapter)}
                    disabled={generating}
                    aria-label={
                      chapter.completed
                        ? `Review ${chapter.title}`
                        : chapter.percent > 0
                          ? `Resume ${chapter.title}`
                          : `Start ${chapter.title}`
                    }
                    className={cn(
                      "grid size-11 shrink-0 place-items-center rounded-full transition",
                      "active:scale-95 disabled:opacity-60",
                      chapter.tier === "dim"
                        ? "bg-surface-sunken text-ink hover:bg-line"
                        : "bg-lumen text-cosmos hover:bg-lumen-deep",
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

              {chapter.percent > 0 && !chapter.completed && (
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full rounded-full bg-lumen-deep transition-[width] duration-500"
                    style={{ width: `${chapter.percent}%` }}
                  />
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export interface MasteryRingProps {
  counts: Record<MasteryTier, number>;
  total: number;
  size?: number;
  className?: string;
}

export function MasteryRing({ counts, total, size = 148, className }: MasteryRingProps) {
  const thickness = size * 0.1;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  const SEGMENTS: Array<{ tier: MasteryTier; color: string }> = [
    { tier: "prism", color: "var(--color-lumen)" },
    { tier: "radiant", color: "var(--color-ray-3)" },
    { tier: "bright", color: "var(--color-ray-2)" },
    { tier: "lit", color: "var(--color-ray-1)" },
  ];

  const touched = SEGMENTS.reduce((sum, s) => sum + (counts[s.tier] ?? 0), 0);
  const coverage = total > 0 ? Math.round((touched / total) * 100) : 0;

  let offset = 0;

  return (
    <div
      role="img"
      aria-label={`${coverage}% of chapters started, ${counts.prism ?? 0} fully retained`}
      style={{ width: size, height: size }}
      className={cn("relative grid shrink-0 place-items-center", className)}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-line)"
          strokeWidth={thickness}
        />
        {SEGMENTS.map((segment) => {
          const count = counts[segment.tier] ?? 0;
          if (count === 0 || total === 0) return null;
          const length = (count / total) * circumference;
          const dash = `${length} ${circumference - length}`;
          const element = (
            <circle
              key={segment.tier}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={thickness}
              strokeLinecap="butt"
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              className="transition-[stroke-dashoffset,stroke-dasharray] duration-700"
            />
          );
          offset += length;
          return element;
        })}
      </svg>

      <span className="absolute inset-0 grid place-items-center text-center">
        <span>
          <span
            className="block font-display font-bold tabular-nums text-ink"
            style={{ fontSize: size * 0.22 }}
          >
            {coverage}%
          </span>
          <span className="block text-[0.625rem] font-medium uppercase tracking-wide text-ink-subtle">
            started
          </span>
        </span>
      </span>
    </div>
  );
}
