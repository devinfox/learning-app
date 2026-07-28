import { generateLesson, generateSyllabus } from "@/lib/ai/generate";
import { db, newId, now } from "@/lib/db";
import type {
  Chapter,
  Interactive,
  Lesson,
  Level,
  Question,
  Quiz,
  Slide,
  Syllabus,
} from "@/lib/db/types";
import { getPack, hasPack, type PackChapter } from "@/lib/courses";
import { ApiError } from "@/lib/http";
import { enqueue, registerJobHandler } from "@/lib/jobs";
import { getSubject } from "./catalog";
import { subjectMastery } from "./mastery";

export const POINTS_PER_QUESTION = 10;

export async function createSyllabusForEnrollment(params: {
  userId: string;
  subjectId: string;
  level: Level;
}): Promise<Syllabus> {
  const subject = await getSubject(params.subjectId);

  const syllabus: Syllabus = {
    id: newId("syl"),
    userId: params.userId,
    subjectId: params.subjectId,
    level: params.level,
    title: subject.name,
    status: "generating",
    error: null,
    chapters: [],
    glossary: [],
    timeline: [],
    createdAt: now(),
    updatedAt: now(),
  };
  await db.syllabi.insert(syllabus);

  await enqueue("generate_syllabus", { syllabusId: syllabus.id });
  return syllabus;
}

registerJobHandler("generate_syllabus", async (payload) => {
  const syllabus = await db.syllabi.get(payload.syllabusId);
  if (!syllabus) return;

  try {
    const subject = await getSubject(syllabus.subjectId);
    const draft = await generateSyllabus({ subject, level: syllabus.level });

    const chapters: Chapter[] = draft.chapters.map((chapter, index) => ({
      id: newId("ch"),
      order: index + 1,
      title: chapter.title,
      summary: chapter.summary,
      objectives: chapter.objectives,
      misconceptions: chapter.misconceptions ?? [],
      lessonId: null,
      lessonStatus: "pending",
    }));

    const pack = getPack(subject.slug, subject.name);

    await db.syllabi.update(syllabus.id, {
      title: draft.title || subject.name,
      chapters,
      glossary: pack.glossary ?? [],
      timeline: pack.timeline ?? [],
      status: "ready",
      error: null,
      updatedAt: now(),
    });
  } catch (error) {
    await db.syllabi.update(syllabus.id, {
      status: "failed",
      error: error instanceof Error ? error.message : "Generation failed",
      updatedAt: now(),
    });
    throw error;
  }
});

export async function getSyllabus(userId: string, syllabusId: string): Promise<Syllabus> {
  const syllabus = await db.syllabi.get(syllabusId);
  if (!syllabus) throw ApiError.notFound("Syllabus not found.");
  if (syllabus.userId !== userId) throw ApiError.forbidden();
  return syllabus;
}

export async function retrySyllabus(userId: string, syllabusId: string): Promise<Syllabus> {
  const syllabus = await getSyllabus(userId, syllabusId);
  if (syllabus.status === "generating") return syllabus;

  const reset =
    (await db.syllabi.update(syllabusId, {
      status: "generating",
      error: null,
      updatedAt: now(),
    })) ?? syllabus;

  await enqueue("generate_syllabus", { syllabusId });
  return reset;
}

export async function ensureLesson(params: {
  userId: string;
  syllabusId: string;
  chapterId: string;
}): Promise<Lesson> {
  const syllabus = await getSyllabus(params.userId, params.syllabusId);
  if (syllabus.status !== "ready") {
    throw ApiError.conflict("The syllabus is still being prepared.");
  }

  const chapter = syllabus.chapters.find((row) => row.id === params.chapterId);
  if (!chapter) throw ApiError.notFound("Chapter not found.");

  const mastery = await subjectMastery(params.userId, syllabus);
  const gate = mastery.chapters.find((row) => row.chapterId === chapter.id);
  if (gate && !gate.unlocked) {
    throw ApiError.forbidden("Pass the previous lesson's quiz to unlock this one.");
  }

  if (chapter.lessonId) {
    const existing = await db.lessons.get(chapter.lessonId);
    if (existing) return existing;
  }

  const lesson: Lesson = {
    id: newId("les"),
    syllabusId: syllabus.id,
    chapterId: chapter.id,
    userId: params.userId,
    subjectId: syllabus.subjectId,
    title: chapter.title,
    status: "generating",
    error: null,
    slides: [],
    quizId: null,
    createdAt: now(),
    updatedAt: now(),
  };
  await db.lessons.insert(lesson);

  await db.syllabi.mutate(syllabus.id, (row) => ({
    ...row,
    chapters: row.chapters.map((candidate) =>
      candidate.id === chapter.id
        ? { ...candidate, lessonId: lesson.id, lessonStatus: "generating" as const }
        : candidate,
    ),
    updatedAt: now(),
  }));

  await enqueue("generate_lesson", { lessonId: lesson.id });
  return lesson;
}

registerJobHandler("generate_lesson", async (payload) => {
  const lesson = await db.lessons.get(payload.lessonId);
  if (!lesson) return;

  const syllabus = await db.syllabi.get(lesson.syllabusId);
  if (!syllabus) return;

  const chapter = syllabus.chapters.find((row) => row.id === lesson.chapterId);
  if (!chapter) return;

  try {
    const subject = await getSubject(lesson.subjectId);

    const authored = hasPack(subject.slug)
      ? getPack(subject.slug, subject.name).chapters.find(
          (candidate) => candidate.title === chapter.title,
        )
      : undefined;

    if (authored) {
      await materialisePackChapter({ lesson, chapter, authored });
      return;
    }

    const draft = await generateLesson({
      subject,
      level: syllabus.level,
      chapterTitle: chapter.title,
      chapterSummary: chapter.summary,
      objectives: chapter.objectives,
      precedingChapters: syllabus.chapters
        .filter((row) => row.order < chapter.order)
        .map((row) => row.title),
    });

    const slides: Slide[] = draft.slides.map((slide, index) => ({
      id: newId("sld"),
      order: index + 1,
      heading: slide.heading,
      body: slide.body,
      image: slide.image,
      reading: slide.reading ?? null,
      interactive: slide.interactive
        ? ({ id: newId("int"), ...slide.interactive } satisfies Interactive)
        : null,
    }));

    const quiz: Quiz = {
      id: newId("qz"),
      kind: "lesson",
      userId: lesson.userId,
      subjectId: lesson.subjectId,
      lessonId: lesson.id,
      title: `${draft.title || chapter.title} Quiz`,
      status: "ready",
      error: null,
      questions: draft.quiz.map(
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
      createdAt: now(),
    };
    await db.quizzes.insert(quiz);

    await db.lessons.update(lesson.id, {
      title: draft.title || chapter.title,
      slides,
      quizId: quiz.id,
      status: "ready",
      error: null,
      updatedAt: now(),
    });

    await db.syllabi.mutate(syllabus.id, (row) => ({
      ...row,
      chapters: row.chapters.map((candidate) =>
        candidate.id === chapter.id
          ? { ...candidate, lessonStatus: "ready" as const }
          : candidate,
      ),
      updatedAt: now(),
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed";
    await db.lessons.update(lesson.id, {
      status: "failed",
      error: message,
      updatedAt: now(),
    });
    await db.syllabi.mutate(syllabus.id, (row) => ({
      ...row,
      chapters: row.chapters.map((candidate) =>
        candidate.id === chapter.id
          ? { ...candidate, lessonStatus: "failed" as const }
          : candidate,
      ),
    }));
    throw error;
  }
});

async function materialisePackChapter(params: {
  lesson: Lesson;
  chapter: Chapter;
  authored: PackChapter;
}): Promise<void> {
  const { lesson, chapter, authored } = params;

  const slides: Slide[] = authored.slides.map((slide, index) => ({
    id: newId("sld"),
    order: index + 1,
    heading: slide.heading,
    body: slide.body,
    image: slide.image ?? null,
    reading: slide.reading ?? null,
    interactive: slide.interactive
      ? ({ id: newId("int"), ...slide.interactive } satisfies Interactive)
      : null,
  }));

  const quiz: Quiz = {
    id: newId("qz"),
    kind: "lesson",
    userId: lesson.userId,
    subjectId: lesson.subjectId,
    lessonId: lesson.id,
    title: `${authored.title} Quiz`,
    status: "ready",
    error: null,
    questions: authored.quiz.map(
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
    createdAt: now(),
  };
  await db.quizzes.insert(quiz);

  await db.lessons.update(lesson.id, {
    title: authored.title,
    slides,
    quizId: quiz.id,
    status: "ready",
    error: null,
    updatedAt: now(),
  });

  await db.syllabi.mutate(lesson.syllabusId, (row) => ({
    ...row,
    chapters: row.chapters.map((candidate) =>
      candidate.id === chapter.id
        ? {
            ...candidate,
            lessonStatus: "ready" as const,
            objectives: authored.objectives,
            misconceptions: authored.misconceptions ?? candidate.misconceptions,
          }
        : candidate,
    ),
    updatedAt: now(),
  }));
}

export async function getLesson(userId: string, lessonId: string): Promise<Lesson> {
  const lesson = await db.lessons.get(lessonId);
  if (!lesson) throw ApiError.notFound("Lesson not found.");
  if (lesson.userId !== userId) throw ApiError.forbidden();
  return lesson;
}

export async function retryLesson(userId: string, lessonId: string): Promise<Lesson> {
  const lesson = await getLesson(userId, lessonId);
  if (lesson.status === "generating") return lesson;

  const reset =
    (await db.lessons.update(lessonId, {
      status: "generating",
      error: null,
      updatedAt: now(),
    })) ?? lesson;

  await enqueue("generate_lesson", { lessonId });
  return reset;
}
