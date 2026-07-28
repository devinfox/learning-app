import { requireVerified } from "@/lib/auth/session";
import { handler, json } from "@/lib/http";
import { getEnrollment } from "@/lib/services/enrollment";
import { ensurePlacementQuiz, startAttempt, toQuizView } from "@/lib/services/quizzes";

export const GET = handler(
  async (
    _request: Request,
    ctx: RouteContext<"/api/me/subjects/[subjectId]/placement">,
  ) => {
    const { user } = await requireVerified();
    const { subjectId } = await ctx.params;

    await getEnrollment(user.id, subjectId);

    const quiz = await ensurePlacementQuiz({ userId: user.id, subjectId });

    if (quiz.status !== "ready") {
      return json({ quiz: toQuizView(quiz), attemptId: null, startedAt: null });
    }

    const attempt = await startAttempt(user.id, quiz);
    return json({ quiz: toQuizView(quiz), attemptId: attempt.id, startedAt: attempt.startedAt });
  },
);
