import { requireVerified } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { ApiError, handler, json } from "@/lib/http";
import { retryPlacementQuiz, toQuizView } from "@/lib/services/quizzes";

export const POST = handler(
  async (
    _request: Request,
    ctx: RouteContext<"/api/me/subjects/[subjectId]/placement/retry">,
  ) => {
    const { user } = await requireVerified();
    const { subjectId } = await ctx.params;

    const quiz = await db.quizzes.findOne(
      (row) =>
        row.kind === "placement" && row.userId === user.id && row.subjectId === subjectId,
    );
    if (!quiz) throw ApiError.notFound("No placement check to retry.");

    return json({ quiz: toQuizView(await retryPlacementQuiz(user.id, quiz.id)) });
  },
);
