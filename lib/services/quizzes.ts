import { generatePlacementQuiz } from "@/lib/ai/generate";
import { db, newId, now } from "@/lib/db";
import type { Attempt, Level, Question, Quiz } from "@/lib/db/types";
import { ApiError } from "@/lib/http";
import { enqueue, registerJobHandler } from "@/lib/jobs";
import { getSubject } from "./catalog";
import { POINTS_PER_QUESTION } from "./courses";

const PASS_THRESHOLD = 0.6;

export interface QuizView {
  id: string;
  kind: Quiz["kind"];
  title: string;
  status: Quiz["status"];
  error: string | null;
  subjectId: string;
  lessonId: string | null;
  questions: Array<{
    id: string;
    order: number;
    prompt: string;
    options: string[];
    points: number;
  }>;
  totalQuestions: number;
  maxScore: number;
}

export function toQuizView(quiz: Quiz): QuizView {
  return {
    id: quiz.id,
    kind: quiz.kind,
    title: quiz.title,
    status: quiz.status,
    error: quiz.error,
    subjectId: quiz.subjectId,
    lessonId: quiz.lessonId,
    questions: quiz.questions.map((question) => ({
      id: question.id,
      order: question.order,
      prompt: question.prompt,
      options: question.options,
      points: question.points,
    })),
    totalQuestions: quiz.questions.length,
    maxScore: quiz.questions.reduce((sum, question) => sum + question.points, 0),
  };
}

export async function ensurePlacementQuiz(params: {
  userId: string;
  subjectId: string;
}): Promise<Quiz> {
  const existing = await db.quizzes.findOne(
    (quiz) =>
      quiz.kind === "placement" &&
      quiz.userId === params.userId &&
      quiz.subjectId === params.subjectId,
  );
  if (existing) return existing;

  const subject = await getSubject(params.subjectId);

  const quiz: Quiz = {
    id: newId("qz"),
    kind: "placement",
    userId: params.userId,
    subjectId: params.subjectId,
    lessonId: null,
    title: `${subject.name} Placement Check`,
    status: "generating",
    error: null,
    questions: [],
    createdAt: now(),
  };
  await db.quizzes.insert(quiz);

  await enqueue("generate_placement_quiz", { quizId: quiz.id });
  return quiz;
}

registerJobHandler("generate_placement_quiz", async (payload) => {
  const quiz = await db.quizzes.get(payload.quizId);
  if (!quiz) return;

  try {
    const subject = await getSubject(quiz.subjectId);
    const draft = await generatePlacementQuiz({ subject });

    await db.quizzes.update(quiz.id, {
      title: draft.title || `${subject.name} Placement Check`,
      status: "ready",
      error: null,
      questions: draft.questions.map(
        (question, index): Question => ({
          id: newId("q"),
          order: index + 1,
          prompt: question.prompt,
          options: question.options,
          answerIndex: question.answerIndex,
          explanation: question.explanation,
          points: POINTS_PER_QUESTION,
        }),
      ),
    });
  } catch (error) {
    await db.quizzes.update(quiz.id, {
      status: "failed",
      error: error instanceof Error ? error.message : "Generation failed",
    });
    throw error;
  }
});

export async function retryPlacementQuiz(userId: string, quizId: string): Promise<Quiz> {
  const quiz = await getQuiz(userId, quizId);
  if (quiz.status === "generating") return quiz;

  const reset =
    (await db.quizzes.update(quizId, { status: "generating", error: null })) ?? quiz;
  await enqueue("generate_placement_quiz", { quizId });
  return reset;
}

export async function getQuiz(userId: string, quizId: string): Promise<Quiz> {
  const quiz = await db.quizzes.get(quizId);
  if (!quiz) throw ApiError.notFound("Quiz not found.");
  if (quiz.userId !== userId) throw ApiError.forbidden();
  return quiz;
}

export async function startAttempt(userId: string, quiz: Quiz): Promise<Attempt> {
  const open = await db.attempts.findOne(
    (attempt) =>
      attempt.userId === userId && attempt.quizId === quiz.id && attempt.submittedAt === null,
  );
  if (open) return open;

  const attempt: Attempt = {
    id: newId("att"),
    userId,
    quizId: quiz.id,
    kind: quiz.kind,
    subjectId: quiz.subjectId,
    startedAt: now(),
    submittedAt: null,
    answers: {},
    correctCount: 0,
    totalQuestions: quiz.questions.length,
    score: 0,
    maxScore: quiz.questions.reduce((sum, question) => sum + question.points, 0),
    durationSeconds: 0,
    passed: false,
  };
  await db.attempts.insert(attempt);
  return attempt;
}

export interface GradedAnswer {
  questionId: string;
  selectedIndex: number | null;
  correctIndex: number;
  correct: boolean;
  explanation: string;
}

export interface AttemptResult {
  attempt: Attempt;
  answers: GradedAnswer[];
}

export async function submitAttempt(params: {
  userId: string;
  attemptId: string;
  answers: Record<string, number>;
}): Promise<AttemptResult> {
  const attempt = await db.attempts.get(params.attemptId);
  if (!attempt) throw ApiError.notFound("Attempt not found.");
  if (attempt.userId !== params.userId) throw ApiError.forbidden();
  if (attempt.submittedAt) throw ApiError.conflict("This attempt was already submitted.");

  const quiz = await db.quizzes.get(attempt.quizId);
  if (!quiz) throw ApiError.notFound("Quiz not found.");

  const graded: GradedAnswer[] = quiz.questions.map((question) => {
    const selected = params.answers[question.id];
    const selectedIndex =
      typeof selected === "number" && selected >= 0 && selected < question.options.length
        ? selected
        : null;
    return {
      questionId: question.id,
      selectedIndex,
      correctIndex: question.answerIndex,
      correct: selectedIndex === question.answerIndex,
      explanation: question.explanation,
    };
  });

  const correctCount = graded.filter((answer) => answer.correct).length;
  const score = quiz.questions.reduce(
    (sum, question, index) => (graded[index].correct ? sum + question.points : sum),
    0,
  );
  const maxScore = quiz.questions.reduce((sum, question) => sum + question.points, 0);
  const submittedAt = now();
  const durationSeconds = Math.max(
    0,
    Math.round((Date.parse(submittedAt) - Date.parse(attempt.startedAt)) / 1000),
  );

  const updated = await db.attempts.update(attempt.id, {
    submittedAt,
    answers: params.answers,
    correctCount,
    score,
    maxScore,
    durationSeconds,
    passed: maxScore > 0 && score / maxScore >= PASS_THRESHOLD,
  });

  return { attempt: updated ?? attempt, answers: graded };
}

export async function getAttemptResult(
  userId: string,
  attemptId: string,
): Promise<AttemptResult & { quiz: Quiz }> {
  const attempt = await db.attempts.get(attemptId);
  if (!attempt) throw ApiError.notFound("Attempt not found.");
  if (attempt.userId !== userId) throw ApiError.forbidden();
  if (!attempt.submittedAt) throw ApiError.conflict("That attempt is not finished.");

  const quiz = await db.quizzes.get(attempt.quizId);
  if (!quiz) throw ApiError.notFound("Quiz not found.");

  const answers: GradedAnswer[] = quiz.questions.map((question) => {
    const selected = attempt.answers[question.id];
    return {
      questionId: question.id,
      selectedIndex: typeof selected === "number" ? selected : null,
      correctIndex: question.answerIndex,
      correct: selected === question.answerIndex,
      explanation: question.explanation,
    };
  });

  return { attempt, answers, quiz };
}

export function levelFromScore(score: number, maxScore: number): Level {
  if (maxScore <= 0) return "beginner";
  const ratio = score / maxScore;
  if (ratio < 0.4) return "beginner";
  if (ratio < 0.75) return "intermediate";
  return "advanced";
}
