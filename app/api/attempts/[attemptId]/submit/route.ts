import { requireVerified } from "@/lib/auth/session";
import { handler, json, readJson } from "@/lib/http";
import { submitAttemptSchema } from "@/lib/schemas";
import { completePlacement } from "@/lib/services/enrollment";
import { levelFromScore, submitAttempt } from "@/lib/services/quizzes";
import { earnedIds, rewardLedger } from "@/lib/gamification";

export const POST = handler(
  async (request: Request, ctx: RouteContext<"/api/attempts/[attemptId]/submit">) => {
    const { user } = await requireVerified();
    const { attemptId } = await ctx.params;
    const { answers } = await readJson(request, submitAttemptSchema);

    const before = earnedIds(await rewardLedger(user.id));

    const { attempt, answers: graded } = await submitAttempt({
      userId: user.id,
      attemptId,
      answers,
    });

    const after = await rewardLedger(user.id);
    const unlocked = after.earned.filter((row) => !before.has(row.reward.id));

    let level = null;
    let syllabusId: string | null = null;

    if (attempt.kind === "placement") {
      level = levelFromScore(attempt.score, attempt.maxScore);
      const enrollment = await completePlacement({
        userId: user.id,
        subjectId: attempt.subjectId,
        score: attempt.score,
        level,
      });
      syllabusId = enrollment.syllabusId;
    }

    return json({
      result: {
        attemptId: attempt.id,
        kind: attempt.kind,
        subjectId: attempt.subjectId,
        totalQuestions: attempt.totalQuestions,
        correctAnswers: attempt.correctCount,
        score: attempt.score,
        maxScore: attempt.maxScore,
        durationSeconds: attempt.durationSeconds,
        passed: attempt.passed,
      },
      answers: graded,
      unlocked: unlocked.map((row) => ({
        id: row.reward.id,
        name: row.reward.name,
        blurb: row.reward.blurb,
        reason: row.reason,
        earnedAt: row.earnedAt,
      })),
      level,
      syllabusId,
    });
  },
);
