import { db } from "@/lib/db";
import type { Attempt, Progress, ProjectSubmission } from "@/lib/db/types";

export const POINT_RULES = {
  lessonComplete: 10,
  firstTry: 1.5,
  retry: 0.6,
  fullMarksBonus: 25,
  exam: 2,
  final: 3,
  effortFloor: 5,
  effortFloorLimit: 2,
  projectFloor: 60,
  projectTop: 300,
} as const;

export type PointSource =
  | "lesson"
  | "quiz"
  | "quiz_retry"
  | "attempt"
  | "exam"
  | "final"
  | "project";

export interface PointEntry {
  id: string;
  at: string;
  source: PointSource;
  label: string;
  detail: string;
  subjectId: string | null;
  points: number;
}

export interface WeekBucket {
  startsAt: string;
  points: number;
}

export interface SourceTotal {
  source: PointSource;
  label: string;
  points: number;
  count: number;
}

export interface PointsLedger {
  entries: PointEntry[];
  total: number;
  thisWeek: number;
  lastWeek: number;
  bestWeek: number;
  weeks: WeekBucket[];
  bySource: SourceTotal[];
  weekStartsAt: string;
  weekResetsAt: string;
}

const DAY_MS = 86_400_000;

export const SOURCE_LABEL: Record<PointSource, string> = {
  lesson: "Lessons finished",
  quiz: "Quizzes passed",
  quiz_retry: "Quizzes passed on a retake",
  attempt: "Quizzes you sat",
  exam: "Exams",
  final: "Final exams",
  project: "Projects",
};

const LEVEL_STEP = 50;

export interface Level {
  level: number;
  floor: number;
  ceiling: number;
  into: number;
  need: number;
  percent: number;
}

export function levelFor(total: number): Level {
  let level = 1;
  while (total >= LEVEL_STEP * level * (level + 1)) level += 1;

  const floor = level === 1 ? 0 : LEVEL_STEP * (level - 1) * level;
  const ceiling = LEVEL_STEP * level * (level + 1);
  const span = ceiling - floor;

  return {
    level,
    floor,
    ceiling,
    into: total - floor,
    need: ceiling - total,
    percent: span > 0 ? Math.round(((total - floor) / span) * 100) : 0,
  };
}

export function startOfWeek(ms: number): number {
  const date = new Date(ms);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - date.getDay());
  return date.getTime();
}

function multiplierFor(kind: Attempt["kind"]): number {
  if (kind === "final") return POINT_RULES.final;
  if (kind === "exam") return POINT_RULES.exam;
  return 1;
}

function sourceFor(kind: Attempt["kind"], retried: boolean): PointSource {
  if (kind === "final") return "final";
  if (kind === "exam") return "exam";
  return retried ? "quiz_retry" : "quiz";
}

export interface DeriveInput {
  attempts: Attempt[];
  progress: Progress[];
  submissions: ProjectSubmission[];
  subjectName: (subjectId: string) => string;
  projectTitle: (projectId: string) => string;
}

export function derivePoints(input: DeriveInput): PointEntry[] {
  const entries: PointEntry[] = [];

  const byQuiz = new Map<string, Attempt[]>();
  for (const attempt of input.attempts) {
    if (!attempt.submittedAt) continue;
    if (attempt.kind === "placement") continue;
    byQuiz.set(attempt.quizId, [...(byQuiz.get(attempt.quizId) ?? []), attempt]);
  }

  for (const rows of byQuiz.values()) {
    const ordered = [...rows].sort(
      (a, b) => Date.parse(a.submittedAt!) - Date.parse(b.submittedAt!),
    );

    let passed = false;
    let floorsPaid = 0;

    for (const [index, attempt] of ordered.entries()) {
      const subject = input.subjectName(attempt.subjectId);

      if (!attempt.passed) {
        if (floorsPaid >= POINT_RULES.effortFloorLimit) continue;
        floorsPaid += 1;
        entries.push({
          id: `${attempt.id}:floor`,
          at: attempt.submittedAt!,
          source: "attempt",
          label: `${subject} quiz`,
          detail: "Sat the quiz — the pass points are still waiting",
          subjectId: attempt.subjectId,
          points: POINT_RULES.effortFloor,
        });
        continue;
      }

      if (passed) continue;
      passed = true;

      const retried = ordered.slice(0, index).some((row) => !row.passed);
      const multiplier = multiplierFor(attempt.kind);
      const attemptFactor = retried ? POINT_RULES.retry : POINT_RULES.firstTry;
      const perfect = attempt.maxScore > 0 && attempt.score === attempt.maxScore;

      const points =
        Math.round(attempt.score * multiplier * attemptFactor) +
        (perfect ? POINT_RULES.fullMarksBonus * multiplier : 0);

      const noun =
        attempt.kind === "final"
          ? "final exam"
          : attempt.kind === "exam"
            ? "exam"
            : "quiz";

      entries.push({
        id: `${attempt.id}:pass`,
        at: attempt.submittedAt!,
        source: sourceFor(attempt.kind, retried),
        label: `${subject} ${noun}`,
        detail: perfect
          ? "Full marks"
          : retried
            ? "Passed on a retake"
            : "Passed first time",
        subjectId: attempt.subjectId,
        points,
      });
    }
  }

  for (const row of input.progress) {
    if (!row.completed || !row.completedAt) continue;
    entries.push({
      id: `${row.id}:lesson`,
      at: row.completedAt,
      source: "lesson",
      label: "Lesson finished",
      detail: "Every slide, start to end",
      subjectId: null,
      points: POINT_RULES.lessonComplete,
    });
  }

  for (const row of input.submissions) {
    if (row.status !== "scored" || !row.gradedAt) continue;
    const ratio = row.maxScore > 0 ? row.score / row.maxScore : 0;
    entries.push({
      id: `${row.id}:project`,
      at: row.gradedAt,
      source: "project",
      label: input.projectTitle(row.projectId),
      detail: `Scored ${row.score} of ${row.maxScore} against the rubric`,
      subjectId: row.subjectId,
      points:
        POINT_RULES.projectFloor +
        Math.round(ratio * (POINT_RULES.projectTop - POINT_RULES.projectFloor)),
    });
  }

  return entries.sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
}

function summarise(entries: PointEntry[]): PointsLedger {
  const now = Date.now();
  const thisWeekStart = startOfWeek(now);
  const lastWeekStart = startOfWeek(thisWeekStart - DAY_MS);

  const buckets = new Map<number, number>();
  const sources = new Map<PointSource, { points: number; count: number }>();

  for (const entry of entries) {
    const week = startOfWeek(Date.parse(entry.at));
    buckets.set(week, (buckets.get(week) ?? 0) + entry.points);

    const current = sources.get(entry.source) ?? { points: 0, count: 0 };
    sources.set(entry.source, {
      points: current.points + entry.points,
      count: current.count + 1,
    });
  }

  const weeks = [...buckets.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([startsAt, points]) => ({
      startsAt: new Date(startsAt).toISOString(),
      points,
    }));

  return {
    entries,
    total: entries.reduce((sum, entry) => sum + entry.points, 0),
    thisWeek: buckets.get(thisWeekStart) ?? 0,
    lastWeek: buckets.get(lastWeekStart) ?? 0,
    bestWeek: Math.max(0, ...buckets.values()),
    weeks,
    bySource: [...sources.entries()]
      .map(([source, value]) => ({ source, label: SOURCE_LABEL[source], ...value }))
      .sort((a, b) => b.points - a.points),
    weekStartsAt: new Date(thisWeekStart).toISOString(),
    weekResetsAt: new Date(thisWeekStart + 7 * DAY_MS).toISOString(),
  };
}

export function summarisePoints(entries: PointEntry[]): PointsLedger {
  return summarise(entries);
}

export async function pointsLedger(userId: string): Promise<PointsLedger> {
  const [subjects, attempts, progress, submissions, projects] = await Promise.all([
    db.subjects.all(),
    db.attempts.find((row) => row.userId === userId && row.submittedAt !== null),
    db.progress.find((row) => row.userId === userId),
    db.submissions.find((row) => row.userId === userId),
    db.projects.find((row) => row.userId === userId),
  ]);

  const subjectById = new Map(subjects.map((row) => [row.id, row.name]));
  const projectById = new Map(projects.map((row) => [row.id, row.title]));

  return summarise(
    derivePoints({
      attempts,
      progress,
      submissions,
      subjectName: (id) => subjectById.get(id) ?? "Your course",
      projectTitle: (id) => projectById.get(id) ?? "A project",
    }),
  );
}

export interface LearnerPoints {
  userId: string;
  total: number;
  thisWeek: number;
  lastWeek: number;
  bestWeek: number;
}

export async function allLearnerPoints(): Promise<LearnerPoints[]> {
  const [subjects, attempts, progress, submissions, projects] = await Promise.all([
    db.subjects.all(),
    db.attempts.find((row) => row.submittedAt !== null),
    db.progress.all(),
    db.submissions.all(),
    db.projects.all(),
  ]);

  const subjectById = new Map(subjects.map((row) => [row.id, row.name]));
  const projectById = new Map(projects.map((row) => [row.id, row.title]));

  const userIds = new Set([
    ...attempts.map((row) => row.userId),
    ...progress.map((row) => row.userId),
    ...submissions.map((row) => row.userId),
  ]);

  return [...userIds].map((userId) => {
    const ledger = summarise(
      derivePoints({
        attempts: attempts.filter((row) => row.userId === userId),
        progress: progress.filter((row) => row.userId === userId),
        submissions: submissions.filter((row) => row.userId === userId),
        subjectName: (id) => subjectById.get(id) ?? "Your course",
        projectTitle: (id) => projectById.get(id) ?? "A project",
      }),
    );

    return {
      userId,
      total: ledger.total,
      thisWeek: ledger.thisWeek,
      lastWeek: ledger.lastWeek,
      bestWeek: ledger.bestWeek,
    };
  });
}
