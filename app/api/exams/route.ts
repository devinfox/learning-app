import { requireVerified } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { handler, json, readJson } from "@/lib/http";
import { startExamSchema } from "@/lib/schemas";
import { ensureExam, examPlan } from "@/lib/services/exams";
import { startAttempt } from "@/lib/services/quizzes";

export const GET = handler(async () => {
  const { user } = await requireVerified();

  const [subjects, syllabi] = await Promise.all([
    db.subjects.all(),
    db.syllabi.find((row) => row.userId === user.id && row.status === "ready"),
  ]);

  const courses = [];

  for (const syllabus of syllabi) {
    const subject = subjects.find((row) => row.id === syllabus.subjectId);
    const exams = await examPlan(user.id, syllabus);

    courses.push({
      syllabusId: syllabus.id,
      subjectId: syllabus.subjectId,
      subjectName: subject?.name ?? syllabus.title,
      exams,
    });
  }

  return json({ courses });
});

export const POST = handler(async (request: Request) => {
  const { user } = await requireVerified();
  const body = await readJson(request, startExamSchema);

  const quiz = await ensureExam({
    userId: user.id,
    syllabusId: body.syllabusId,
    unit: body.unit === "final" ? "final" : body.unit,
  });
  const attempt = await startAttempt(user.id, quiz);

  return json({ quizId: quiz.id, attemptId: attempt.id });
});
