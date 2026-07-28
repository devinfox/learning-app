import { requireVerified } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { handler, json } from "@/lib/http";
import { levelFor, pointsLedger, rewardLedger } from "@/lib/gamification";
import { deriveTier } from "@/lib/services/mastery";
import { getAttemptResult } from "@/lib/services/quizzes";

const REVEAL_WINDOW_MS = 60_000;

export const GET = handler(
  async (_request: Request, ctx: RouteContext<"/api/attempts/[attemptId]">) => {
    const { user } = await requireVerified();
    const { attemptId } = await ctx.params;

    const { attempt, answers, quiz } = await getAttemptResult(user.id, attemptId);
    const submittedAt = Date.parse(attempt.submittedAt!);

    const [points, rewards, subject] = await Promise.all([
      pointsLedger(user.id),
      rewardLedger(user.id),
      db.subjects.get(attempt.subjectId),
    ]);

    const earned = points.entries.filter((entry) => entry.id.startsWith(`${attempt.id}:`));
    const gained = earned.reduce((sum, entry) => sum + entry.points, 0);
    const after = levelFor(points.total);
    const before = levelFor(points.total - gained);

    const unlocked = rewards.unseen.filter(
      (row) => Date.parse(row.earnedAt) >= submittedAt - REVEAL_WINDOW_MS,
    );

    let tier: { before: string; after: string } | null = null;

    if (quiz.lessonId) {
      const lesson = await db.lessons.get(quiz.lessonId);
      if (lesson) {
        const progress = await db.progress.findOne(
          (row) => row.userId === user.id && row.chapterId === lesson.chapterId,
        );
        const passes = await db.attempts.find(
          (row) =>
            row.userId === user.id &&
            row.quizId === quiz.id &&
            row.passed &&
            row.submittedAt !== null,
        );
        const before = deriveTier({
          progress,
          passedAttempts: passes.filter(
            (row) => Date.parse(row.submittedAt!) < submittedAt,
          ),
        });
        const after = deriveTier({ progress, passedAttempts: passes });
        if (before.tier !== after.tier) {
          tier = { before: before.tier, after: after.tier };
        }
      }
    }

    return json({
      attempt: {
        id: attempt.id,
        kind: attempt.kind,
        title: quiz.title,
        subjectId: attempt.subjectId,
        subjectName: subject?.name ?? "Your course",
        lessonId: quiz.lessonId,
        totalQuestions: attempt.totalQuestions,
        correctAnswers: attempt.correctCount,
        score: attempt.score,
        maxScore: attempt.maxScore,
        percent:
          attempt.maxScore > 0
            ? Math.round((attempt.score / attempt.maxScore) * 100)
            : 0,
        durationSeconds: attempt.durationSeconds,
        passed: attempt.passed,
        submittedAt: attempt.submittedAt,
      },
      answers,
      points: {
        earned: earned.map((entry) => ({
          source: entry.source,
          label: entry.label,
          detail: entry.detail,
          points: entry.points,
        })),
        gained,
        thisWeek: points.thisWeek,
        bestWeek: points.bestWeek,
        beatingBest: points.thisWeek >= points.bestWeek && points.thisWeek > 0,
        weekResetsAt: points.weekResetsAt,
        level: after,
        levelledUp: after.level > before.level,
      },
      tier,
      unlocked: unlocked.map((row) => ({
        id: row.reward.id,
        name: row.reward.name,
        blurb: row.reward.blurb,
        reason: row.reason,
        earnedAt: row.earnedAt,
      })),
    });
  },
);
