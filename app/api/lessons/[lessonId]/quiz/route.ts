import { requireVerified } from "@/lib/auth/session";
import { ApiError, handler, json } from "@/lib/http";
import { getLesson } from "@/lib/services/courses";
import { getQuiz, startAttempt, toQuizView } from "@/lib/services/quizzes";

export const GET = handler(
  async (_request: Request, ctx: RouteContext<"/api/lessons/[lessonId]/quiz">) => {
    const { user } = await requireVerified();
    const { lessonId } = await ctx.params;

    const lesson = await getLesson(user.id, lessonId);
    if (!lesson.quizId) {
      throw ApiError.conflict("This lesson's quiz is still being prepared.");
    }

    const quiz = await getQuiz(user.id, lesson.quizId);
    const attempt = await startAttempt(user.id, quiz);

    return json({ quiz: toQuizView(quiz), attemptId: attempt.id, startedAt: attempt.startedAt });
  },
);
