import { POINTS_PER_QUESTION } from "@/lib/services/courses";
import { db, newId } from "./index";
import type { Chapter, Lesson, Quiz, Subject } from "./types";

export function daysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

export function inDays(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString();
}

export interface SideChapterSpec {
  title: string;
  summary: string;
  completedDaysAgo: number | null;
  attempts: Array<{ daysAgo: number; passed: boolean }>;
}

export async function seedSideCourse(params: {
  userId: string;
  subject: Subject;
  chapters: SideChapterSpec[];
  startedDaysAgo: number;
}): Promise<string> {
  const { userId, subject, chapters, startedDaysAgo } = params;

  const syllabusId = newId("syl");
  const built: Chapter[] = [];

  for (const [index, spec] of chapters.entries()) {
    const lesson: Lesson = {
      id: newId("les"),
      syllabusId,
      chapterId: "",
      userId,
      subjectId: subject.id,
      title: spec.title,
      status: "ready",
      error: null,
      slides: [],
      quizId: null,
      createdAt: daysAgo(startedDaysAgo),
      updatedAt: daysAgo(startedDaysAgo),
    };

    const quiz: Quiz = {
      id: newId("qz"),
      kind: "lesson",
      userId,
      subjectId: subject.id,
      lessonId: lesson.id,
      title: `${spec.title} Quiz`,
      status: "ready",
      error: null,
      questions: [],
      createdAt: daysAgo(startedDaysAgo),
    };

    const chapterId = newId("ch");
    lesson.chapterId = chapterId;
    lesson.quizId = quiz.id;

    await db.lessons.insert(lesson);
    await db.quizzes.insert(quiz);

    built.push({
      id: chapterId,
      order: index + 1,
      title: spec.title,
      summary: spec.summary,
      objectives: [],
      misconceptions: [],
      lessonId: lesson.id,
      lessonStatus: "ready",
    });

    if (spec.completedDaysAgo !== null) {
      await db.progress.insert({
        id: newId("prg"),
        userId,
        syllabusId,
        chapterId,
        lessonId: lesson.id,
        slideIndex: 0,
        slideCount: 3,
        attemptedInteractiveIds: [newId("int"), newId("int"), newId("int")],
        completed: true,
        completedAt: daysAgo(spec.completedDaysAgo),
        updatedAt: daysAgo(spec.completedDaysAgo),
      });
    }

    for (const attempt of spec.attempts) {
      await db.attempts.insert({
        id: newId("att"),
        userId,
        quizId: quiz.id,
        kind: "lesson",
        subjectId: subject.id,
        startedAt: daysAgo(attempt.daysAgo),
        submittedAt: daysAgo(attempt.daysAgo),
        answers: {},
        correctCount: attempt.passed ? 4 : 1,
        totalQuestions: 4,
        score: (attempt.passed ? 4 : 1) * POINTS_PER_QUESTION,
        maxScore: 4 * POINTS_PER_QUESTION,
        durationSeconds: 300,
        passed: attempt.passed,
      });
    }
  }

  await db.syllabi.insert({
    id: syllabusId,
    userId,
    subjectId: subject.id,
    level: "beginner",
    title: subject.name,
    status: "ready",
    error: null,
    chapters: built,
    glossary: [],
    timeline: [],
    createdAt: daysAgo(startedDaysAgo),
    updatedAt: daysAgo(1),
  });

  return syllabusId;
}

export async function clearLearner(params: {
  email: string;
  userId: string;
}): Promise<void> {
  const stale = await db.users.find(
    (user) => user.email === params.email || user.id === params.userId,
  );

  for (const previous of stale) {
    await db.profiles.removeWhere((row) => row.userId === previous.id);
    await db.enrollments.removeWhere((row) => row.userId === previous.id);
    await db.syllabi.removeWhere((row) => row.userId === previous.id);
    await db.lessons.removeWhere((row) => row.userId === previous.id);
    await db.quizzes.removeWhere((row) => row.userId === previous.id);
    await db.attempts.removeWhere((row) => row.userId === previous.id);
    await db.progress.removeWhere((row) => row.userId === previous.id);
    await db.learnerMemories.removeWhere((row) => row.userId === previous.id);
    await db.companionStates.removeWhere((row) => row.userId === previous.id);
    await db.users.remove(previous.id);
  }

  await db.sessions.removeWhere(
    (row) =>
      row.userId !== params.userId &&
      stale.some((previous) => previous.id === row.userId),
  );
}
