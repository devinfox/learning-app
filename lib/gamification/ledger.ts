import { db } from "@/lib/db";
import type { Attempt, Progress, Subject, Syllabus } from "@/lib/db/types";
import { deriveTier } from "@/lib/services/mastery";
import { CATALOG } from "./catalog";
import type { EarnedReward, LockedReward, RewardLedger, Trigger } from "./types";

const DAY_MS = 86_400_000;

interface Evidence {
  subjectsBySlug: Map<string, Subject>;
  enrolledSlugs: Set<string>;
  lessonByQuiz: Map<string, string>;
  syllabusBySubjectId: Map<string, Syllabus>;
  progress: Progress[];
  attempts: Attempt[];
  completions: Array<{ at: number; subjectId: string; chapterId: string; label: string }>;
  activity: number[];
}

async function gather(userId: string): Promise<Evidence> {
  const [subjects, syllabi, progress, attempts, quizzes, enrollments] = await Promise.all([
    db.subjects.all(),
    db.syllabi.find((row) => row.userId === userId),
    db.progress.find((row) => row.userId === userId),
    db.attempts.find((row) => row.userId === userId && row.submittedAt !== null),
    db.quizzes.find((row) => row.lessonId !== null),
    db.enrollments.find((row) => row.userId === userId),
  ]);

  const subjectById = new Map(subjects.map((row) => [row.id, row]));
  const enrolledSlugs = new Set(
    enrollments
      .map((row) => subjectById.get(row.subjectId)?.slug)
      .filter((slug): slug is string => Boolean(slug)),
  );

  const lessonByQuiz = new Map(
    quizzes.filter((row) => row.lessonId).map((row) => [row.id, row.lessonId!]),
  );

  const syllabusBySubjectId = new Map(syllabi.map((row) => [row.subjectId, row]));

  const completions = progress
    .filter((row) => row.completed && row.completedAt)
    .map((row) => {
      const syllabus = syllabi.find((candidate) => candidate.id === row.syllabusId);
      const chapter = syllabus?.chapters.find((c) => c.id === row.chapterId);
      return {
        at: Date.parse(row.completedAt!),
        subjectId: row.syllabusId,
        chapterId: row.chapterId,
        label: chapter?.title ?? "a chapter",
      };
    })
    .sort((a, b) => a.at - b.at);

  const activity = [
    ...progress.map((row) => Date.parse(row.updatedAt)),
    ...attempts.map((row) => Date.parse(row.submittedAt!)),
  ]
    .filter(Number.isFinite)
    .sort((a, b) => a - b);

  return {
    subjectsBySlug: new Map(subjects.map((row) => [row.slug, row])),
    enrolledSlugs,
    lessonByQuiz,
    syllabusBySubjectId,
    progress,
    attempts,
    completions,
    activity,
  };
}

function goodWeeks(activity: number[], minDays = 3): number[] {
  const byWeek = new Map<number, Set<string>>();

  for (const stamp of activity) {
    const date = new Date(stamp);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - date.getDay());
    const week = date.getTime();
    byWeek.set(week, (byWeek.get(week) ?? new Set()).add(new Date(stamp).toDateString()));
  }

  return [...byWeek.entries()]
    .filter(([, days]) => days.size >= minDays)
    .map(([week]) => week)
    .sort((a, b) => a - b);
}

function firstGenuineRetry(attempts: Attempt[]): number | null {
  const byQuiz = new Map<string, Attempt[]>();
  for (const attempt of attempts) {
    byQuiz.set(attempt.quizId, [...(byQuiz.get(attempt.quizId) ?? []), attempt]);
  }

  let earliest: number | null = null;

  for (const rows of byQuiz.values()) {
    const ordered = [...rows].sort(
      (a, b) => Date.parse(a.submittedAt!) - Date.parse(b.submittedAt!),
    );
    for (let index = 1; index < ordered.length; index += 1) {
      if (!ordered[index - 1].passed) {
        const at = Date.parse(ordered[index].submittedAt!);
        if (earliest === null || at < earliest) earliest = at;
        break;
      }
    }
  }

  return earliest;
}

function longestAbsence(activity: number[]): { days: number; returnedAt: number } | null {
  let best: { days: number; returnedAt: number } | null = null;

  for (let index = 1; index < activity.length; index += 1) {
    const days = (activity[index] - activity[index - 1]) / DAY_MS;
    if (!best || days > best.days) best = { days, returnedAt: activity[index] };
  }

  return best;
}

function ordinal(n: number): string {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  return `${n}${["th", "st", "nd", "rd"][n % 10] ?? "th"}`;
}

interface Resolution {
  earnedAt: number | null;
  reason: string;
  requirement: string;
  progress: number | null;
}

function resolve(trigger: Trigger, evidence: Evidence): Resolution {
  switch (trigger.kind) {
    case "chapter": {
      const subject = evidence.subjectsBySlug.get(trigger.subjectSlug);
      const syllabus = subject ? evidence.syllabusBySubjectId.get(subject.id) : undefined;
      const chapter = syllabus?.chapters.find((row) => row.order === trigger.chapterOrder);
      const title = chapter?.title ?? `chapter ${trigger.chapterOrder}`;
      const row = chapter
        ? evidence.progress.find((p) => p.chapterId === chapter.id && p.completed)
        : undefined;

      return {
        earnedAt: row?.completedAt ? Date.parse(row.completedAt) : null,
        reason: `Finishing ${title}`,
        requirement: `Finish ${title}`,
        progress: null,
      };
    }

    case "subject_complete": {
      const subject = evidence.subjectsBySlug.get(trigger.subjectSlug);
      const syllabus = subject ? evidence.syllabusBySubjectId.get(subject.id) : undefined;
      const chapters = syllabus?.chapters ?? [];
      const done = chapters.filter((chapter) =>
        evidence.progress.some((row) => row.chapterId === chapter.id && row.completed),
      );
      const complete = chapters.length > 0 && done.length === chapters.length;
      const name = subject?.name ?? trigger.subjectSlug;

      const last = complete
        ? Math.max(
            ...done.map((chapter) => {
              const row = evidence.progress.find((p) => p.chapterId === chapter.id);
              return row?.completedAt ? Date.parse(row.completedAt) : 0;
            }),
          )
        : null;

      return {
        earnedAt: last,
        reason: `Finishing every chapter of ${name}`,
        requirement:
          chapters.length > 0
            ? `Finish all ${chapters.length} chapters of ${name}`
            : `Finish ${name}`,
        progress: chapters.length > 0 ? done.length / chapters.length : null,
      };
    }

    case "chapters_total": {
      const reached = evidence.completions[trigger.count - 1] ?? null;
      return {
        earnedAt: reached?.at ?? null,
        reason: `Finishing ${trigger.count} chapters — the ${ordinal(
          trigger.count,
        )} was ${reached?.label ?? "one of them"}`,
        requirement: `Finish ${trigger.count} chapters`,
        progress: Math.min(1, evidence.completions.length / trigger.count),
      };
    }

    case "quiz_retry": {
      const at = firstGenuineRetry(evidence.attempts);
      return {
        earnedAt: at,
        reason: "Going back to a quiz that hadn't gone well",
        requirement: "Retake a quiz you didn't pass first time",
        progress: null,
      };
    }

    case "return_after_absence": {
      const gap = longestAbsence(evidence.activity);
      const met = gap !== null && gap.days >= trigger.days;
      return {
        earnedAt: met ? gap.returnedAt : null,
        reason: `Coming back after ${Math.round(gap?.days ?? 0)} days away`,
        requirement: `Come back after a week or more away`,
        progress: null,
      };
    }

    case "active_weeks": {
      const weeks = goodWeeks(evidence.activity);
      return {
        earnedAt: weeks.length >= trigger.count ? weeks[trigger.count - 1] : null,
        reason: `${trigger.count} separate weeks with three study days in them`,
        requirement: `Study on 3 days in each of ${trigger.count} different weeks`,
        progress: Math.min(1, weeks.length / trigger.count),
      };
    }

    case "mastery": {
      let earnedAt: number | null = null;

      for (const [, syllabus] of evidence.syllabusBySubjectId) {
        for (const chapter of syllabus.chapters) {
          const progress =
            evidence.progress.find((row) => row.chapterId === chapter.id) ?? null;
          const passed = evidence.attempts.filter(
            (row) =>
              row.passed &&
              row.kind === "lesson" &&
              evidence.lessonByQuiz.get(row.quizId) === chapter.lessonId,
          );
          const { tier } = deriveTier({ progress, passedAttempts: passed });
          if (tier === trigger.tier || (trigger.tier === "radiant" && tier === "prism")) {
            const at = passed.length
              ? Date.parse(passed[passed.length - 1].submittedAt!)
              : null;
            if (at && (earnedAt === null || at < earnedAt)) earnedAt = at;
          }
        }
      }

      return {
        earnedAt,
        reason:
          trigger.tier === "radiant"
            ? "Passing something again a week later"
            : "Still holding a chapter a month on",
        requirement:
          trigger.tier === "radiant"
            ? "Pass a lesson quiz again at least a week later"
            : "Hold a chapter for a month",
        progress: null,
      };
    }

    case "lesson_thorough": {
      const thorough = evidence.progress
        .filter((row) => row.completed && row.completedAt)
        .filter((row) => row.attemptedInteractiveIds.length > 0)
        .sort((a, b) => Date.parse(a.completedAt!) - Date.parse(b.completedAt!));

      return {
        earnedAt: thorough[trigger.count - 1]
          ? Date.parse(thorough[trigger.count - 1].completedAt!)
          : null,
        reason: `${trigger.count} lessons where you answered every question on the way through`,
        requirement: `Answer every practice question in ${trigger.count} lessons`,
        progress: Math.min(1, thorough.length / trigger.count),
      };
    }
  }
}

export async function rewardLedger(userId: string): Promise<RewardLedger> {
  const evidence = await gather(userId);
  const state = await db.companionStates.findOne((row) => row.userId === userId);
  const seen = new Set(state?.seenRewardIds ?? []);

  const earned: EarnedReward[] = [];
  const locked: LockedReward[] = [];

  for (const reward of CATALOG) {
    const resolution = resolve(reward.trigger, evidence);

    if (resolution.earnedAt !== null) {
      earned.push({
        reward,
        earnedAt: new Date(resolution.earnedAt).toISOString(),
        reason: resolution.reason,
      });
    } else {
      if (reward.subjectSlug && !evidence.enrolledSlugs.has(reward.subjectSlug)) continue;

      locked.push({
        reward,
        requirement: resolution.requirement,
        progress: resolution.progress,
      });
    }
  }

  earned.sort((a, b) => Date.parse(b.earnedAt) - Date.parse(a.earnedAt));

  return {
    earned,
    locked,
    unseen: earned.filter((row) => !seen.has(row.reward.id)),
  };
}

export async function newlyEarned(
  userId: string,
  since: Set<string>,
): Promise<EarnedReward[]> {
  const { earned } = await rewardLedger(userId);
  return earned.filter((row) => !since.has(row.reward.id));
}

export function earnedIds(ledger: RewardLedger): Set<string> {
  return new Set(ledger.earned.map((row) => row.reward.id));
}
