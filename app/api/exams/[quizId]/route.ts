import { requireVerified } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { ApiError, handler, json } from "@/lib/http";
import { examPlan } from "@/lib/services/exams";
import { getQuiz, startAttempt, toQuizView } from "@/lib/services/quizzes";

export const GET = handler(
  async (_request: Request, ctx: RouteContext<"/api/exams/[quizId]">) => {
    const { user } = await requireVerified();
    const { quizId } = await ctx.params;

    const quiz = await getQuiz(user.id, quizId);
    if (quiz.kind !== "exam" && quiz.kind !== "final") {
      throw ApiError.notFound("Exam not found.");
    }

    const syllabus = await db.syllabi.findOne(
      (row) => row.userId === user.id && row.subjectId === quiz.subjectId,
    );
    const entry = syllabus
      ? (await examPlan(user.id, syllabus)).find((row) => row.id === quiz.id)
      : undefined;

    const attempt = await startAttempt(user.id, quiz);
    const subject = await db.subjects.get(quiz.subjectId);

    return json({
      quiz: toQuizView(quiz),
      attemptId: attempt.id,
      startedAt: attempt.startedAt,
      exam: {
        kind: quiz.kind,
        subjectName: subject?.name ?? "Your course",
        covers: entry?.chapterTitles ?? [],
        previousBest: entry?.best ?? null,
        attempts: entry?.attempts ?? 0,
      },
    });
  },
);
