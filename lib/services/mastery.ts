import { db } from "@/lib/db";
import type { Attempt, Progress, Syllabus } from "@/lib/db/types";

export type MasteryTier = "dim" | "lit" | "bright" | "radiant" | "prism";

export const TIER_ORDER: MasteryTier[] = ["dim", "lit", "bright", "radiant", "prism"];

export const TIER_RAYS: Record<MasteryTier, number> = {
  dim: 0,
  lit: 1,
  bright: 2,
  radiant: 4,
  prism: 4,
};

export const TIER_LABEL: Record<MasteryTier, string> = {
  dim: "Not started",
  lit: "Lesson done",
  bright: "Quiz passed",
  radiant: "Held for a week",
  prism: "Held for a month",
};

const RADIANT_AFTER_DAYS = 7;
const PRISM_AFTER_DAYS = 30;

export const DECAY_ENABLED = false;
export const DECAY_AFTER_DAYS = 180;

const DAY_MS = 86_400_000;

export const SEQUENTIAL_GATING = true;

export interface ChapterMastery {
  chapterId: string;
  tier: MasteryTier;
  unlocked: boolean;
  percent: number;
  completed: boolean;
  nextTierAt: string | null;
  passedAttempts: number;
}

export function deriveTier(params: {
  progress: Progress | null;
  passedAttempts: Attempt[];
  now?: number;
}): { tier: MasteryTier; nextTierAt: string | null } {
  const now = params.now ?? Date.now();

  if (!params.progress?.completed) {
    return { tier: "dim", nextTierAt: null };
  }

  const passes = [...params.passedAttempts]
    .filter((attempt) => attempt.submittedAt)
    .sort((a, b) => Date.parse(a.submittedAt!) - Date.parse(b.submittedAt!));

  if (passes.length === 0) {
    return { tier: "lit", nextTierAt: null };
  }

  const first = Date.parse(passes[0].submittedAt!);
  const latest = Date.parse(passes[passes.length - 1].submittedAt!);
  const spanDays = (latest - first) / DAY_MS;

  if (passes.length < 2) {
    return {
      tier: "bright",
      nextTierAt: new Date(first + RADIANT_AFTER_DAYS * DAY_MS).toISOString(),
    };
  }

  if (spanDays >= PRISM_AFTER_DAYS) {
    if (DECAY_ENABLED && (now - latest) / DAY_MS >= DECAY_AFTER_DAYS) {
      return { tier: "radiant", nextTierAt: null };
    }
    return { tier: "prism", nextTierAt: null };
  }

  if (spanDays >= RADIANT_AFTER_DAYS) {
    return {
      tier: "radiant",
      nextTierAt: new Date(first + PRISM_AFTER_DAYS * DAY_MS).toISOString(),
    };
  }

  return {
    tier: "bright",
    nextTierAt: new Date(first + RADIANT_AFTER_DAYS * DAY_MS).toISOString(),
  };
}

export interface SubjectMastery {
  chapters: ChapterMastery[];
  counts: Record<MasteryTier, number>;
  coveragePercent: number;
  currentChapterId: string | null;
}

export async function subjectMastery(
  userId: string,
  syllabus: Syllabus,
): Promise<SubjectMastery> {
  const progressRows = await db.progress.find(
    (row) => row.userId === userId && row.syllabusId === syllabus.id,
  );
  const lessons = await db.lessons.find((row) => row.syllabusId === syllabus.id);
  const attempts = await db.attempts.find(
    (row) => row.userId === userId && row.kind === "lesson" && row.passed,
  );

  const quizToLesson = new Map<string, string>();
  const quizzes = await db.quizzes.find((quiz) => quiz.lessonId !== null);
  for (const quiz of quizzes) {
    if (quiz.lessonId) quizToLesson.set(quiz.id, quiz.lessonId);
  }

  const ordered = [...syllabus.chapters].sort((a, b) => a.order - b.order);

  let previousPassed = true;

  const chapters: ChapterMastery[] = ordered.map((chapter, index) => {
    const progress = progressRows.find((row) => row.chapterId === chapter.id) ?? null;
    const lesson = lessons.find((row) => row.chapterId === chapter.id);

    const passed = lesson
      ? attempts.filter((attempt) => quizToLesson.get(attempt.quizId) === lesson.id)
      : [];

    const { tier, nextTierAt } = deriveTier({ progress, passedAttempts: passed });

    const percent = progress
      ? progress.completed
        ? 100
        : progress.slideCount > 0
          ? Math.round((progress.slideIndex / progress.slideCount) * 100)
          : 0
      : 0;

    const unlocked = !SEQUENTIAL_GATING || index === 0 || previousPassed;
    previousPassed = passed.length > 0;

    return {
      chapterId: chapter.id,
      tier,
      unlocked,
      percent,
      completed: Boolean(progress?.completed),
      nextTierAt,
      passedAttempts: passed.length,
    };
  });

  const counts = TIER_ORDER.reduce(
    (acc, tier) => ({ ...acc, [tier]: chapters.filter((c) => c.tier === tier).length }),
    {} as Record<MasteryTier, number>,
  );

  const touched = chapters.filter((chapter) => chapter.tier !== "dim").length;

  return {
    chapters,
    counts,
    coveragePercent:
      chapters.length > 0 ? Math.round((touched / chapters.length) * 100) : 0,
    currentChapterId:
      chapters.find((chapter) => chapter.unlocked && !chapter.completed)?.chapterId ??
      chapters[chapters.length - 1]?.chapterId ??
      null,
  };
}

export interface WeekStats {
  sessionsThisWeek: number;
  weeklyGoal: number;
  bestWeekSessions: number;
  chaptersBrightenedThisWeek: number;
}

export async function weekStats(userId: string, weeklyGoal = 4): Promise<WeekStats> {
  const progressRows = await db.progress.find((row) => row.userId === userId);
  const attempts = await db.attempts.find(
    (row) => row.userId === userId && row.submittedAt !== null,
  );

  const stamps = [
    ...progressRows.map((row) => Date.parse(row.updatedAt)),
    ...attempts.map((row) => Date.parse(row.submittedAt!)),
  ].filter(Number.isFinite);

  const startOfWeek = (ms: number) => {
    const date = new Date(ms);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - date.getDay());
    return date.getTime();
  };

  const byWeek = new Map<number, Set<string>>();
  for (const stamp of stamps) {
    const week = startOfWeek(stamp);
    const day = new Date(stamp).toDateString();
    byWeek.set(week, (byWeek.get(week) ?? new Set()).add(day));
  }

  const thisWeek = startOfWeek(Date.now());
  const weekAgo = Date.now() - 7 * DAY_MS;

  return {
    sessionsThisWeek: byWeek.get(thisWeek)?.size ?? 0,
    weeklyGoal,
    bestWeekSessions: Math.max(0, ...[...byWeek.values()].map((days) => days.size)),
    chaptersBrightenedThisWeek: attempts.filter(
      (attempt) => attempt.passed && Date.parse(attempt.submittedAt!) >= weekAgo,
    ).length,
  };
}
