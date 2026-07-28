import { db, newId, now } from "@/lib/db";
import type { Progress, Syllabus } from "@/lib/db/types";
import { ApiError } from "@/lib/http";
import { getLesson } from "./courses";

export interface ProgressSummary {
  totalTopics: number;
  completed: number;
  remaining: number;
  percent: number;
}

export const EMPTY_PROGRESS: ProgressSummary = {
  totalTopics: 0,
  completed: 0,
  remaining: 0,
  percent: 0,
};

export async function summariseSyllabusProgress(
  userId: string,
  syllabus: Syllabus | null,
): Promise<ProgressSummary> {
  if (!syllabus || syllabus.status !== "ready") return EMPTY_PROGRESS;

  const totalTopics = syllabus.chapters.length;
  if (totalTopics === 0) return EMPTY_PROGRESS;

  const rows = await db.progress.find(
    (row) => row.userId === userId && row.syllabusId === syllabus.id,
  );
  const completed = rows.filter((row) => row.completed).length;

  return {
    totalTopics,
    completed,
    remaining: totalTopics - completed,
    percent: Math.round((completed / totalTopics) * 100),
  };
}

export async function chapterProgress(
  userId: string,
  syllabus: Syllabus,
): Promise<Record<string, { percent: number; completed: boolean; slideIndex: number }>> {
  const rows = await db.progress.find(
    (row) => row.userId === userId && row.syllabusId === syllabus.id,
  );
  const byChapter = new Map(rows.map((row) => [row.chapterId, row]));

  const result: Record<string, { percent: number; completed: boolean; slideIndex: number }> = {};
  for (const chapter of syllabus.chapters) {
    const row = byChapter.get(chapter.id);
    if (!row) {
      result[chapter.id] = { percent: 0, completed: false, slideIndex: 0 };
      continue;
    }
    const percent = row.completed
      ? 100
      : row.slideCount > 0
        ? Math.round((row.slideIndex / row.slideCount) * 100)
        : 0;
    result[chapter.id] = { percent, completed: row.completed, slideIndex: row.slideIndex };
  }
  return result;
}

export async function recordSlideProgress(params: {
  userId: string;
  lessonId: string;
  slideIndex: number;
}): Promise<Progress> {
  const lesson = await getLesson(params.userId, params.lessonId);
  if (lesson.status !== "ready") {
    throw ApiError.conflict("This lesson is still being prepared.");
  }

  const slideCount = lesson.slides.length;
  const slideIndex = Math.max(0, Math.min(params.slideIndex, Math.max(slideCount - 1, 0)));

  const existing = await db.progress.findOne(
    (row) => row.userId === params.userId && row.lessonId === lesson.id,
  );

  if (existing) {
    const updated = await db.progress.update(existing.id, {
      slideIndex: Math.max(existing.slideIndex, slideIndex),
      slideCount,
      updatedAt: now(),
    });
    return updated ?? existing;
  }

  const record: Progress = {
    id: newId("prg"),
    userId: params.userId,
    syllabusId: lesson.syllabusId,
    chapterId: lesson.chapterId,
    lessonId: lesson.id,
    slideIndex,
    slideCount,
    attemptedInteractiveIds: [],
    completed: false,
    completedAt: null,
    updatedAt: now(),
  };
  await db.progress.insert(record);
  return record;
}

export async function recordInteractiveAttempt(params: {
  userId: string;
  lessonId: string;
  interactiveId: string;
}): Promise<void> {
  const existing = await db.progress.findOne(
    (row) => row.userId === params.userId && row.lessonId === params.lessonId,
  );

  if (existing) {
    if (existing.attemptedInteractiveIds.includes(params.interactiveId)) return;
    await db.progress.update(existing.id, {
      attemptedInteractiveIds: [...existing.attemptedInteractiveIds, params.interactiveId],
      updatedAt: now(),
    });
    return;
  }

  const lesson = await getLesson(params.userId, params.lessonId);
  await db.progress.insert({
    id: newId("prg"),
    userId: params.userId,
    syllabusId: lesson.syllabusId,
    chapterId: lesson.chapterId,
    lessonId: lesson.id,
    slideIndex: 0,
    slideCount: lesson.slides.length,
    attemptedInteractiveIds: [params.interactiveId],
    completed: false,
    completedAt: null,
    updatedAt: now(),
  });
}

export async function completeLesson(params: {
  userId: string;
  lessonId: string;
}): Promise<Progress> {
  const lesson = await getLesson(params.userId, params.lessonId);
  if (lesson.status !== "ready") {
    throw ApiError.conflict("This lesson is still being prepared.");
  }

  const slideCount = lesson.slides.length;
  const existing = await db.progress.findOne(
    (row) => row.userId === params.userId && row.lessonId === lesson.id,
  );

  const required = lesson.slides
    .map((slide) => slide.interactive?.id)
    .filter((id): id is string => Boolean(id));
  const attempted = new Set(existing?.attemptedInteractiveIds ?? []);
  const missing = required.filter((id) => !attempted.has(id));

  if (missing.length > 0) {
    throw ApiError.conflict(
      missing.length === 1
        ? "Answer the practice question on this lesson before finishing it."
        : `Answer the ${missing.length} practice questions in this lesson before finishing it.`,
    );
  }

  if (existing) {
    const updated = await db.progress.update(existing.id, {
      slideIndex: Math.max(slideCount - 1, 0),
      slideCount,
      completed: true,
      completedAt: existing.completedAt ?? now(),
      updatedAt: now(),
    });
    return updated ?? existing;
  }

  const record: Progress = {
    id: newId("prg"),
    userId: params.userId,
    syllabusId: lesson.syllabusId,
    chapterId: lesson.chapterId,
    lessonId: lesson.id,
    slideIndex: Math.max(slideCount - 1, 0),
    slideCount,
    attemptedInteractiveIds: [],
    completed: true,
    completedAt: now(),
    updatedAt: now(),
  };
  await db.progress.insert(record);
  return record;
}

export async function nextChapter(userId: string, syllabus: Syllabus) {
  if (syllabus.status !== "ready" || syllabus.chapters.length === 0) return null;

  const rows = await db.progress.find(
    (row) => row.userId === userId && row.syllabusId === syllabus.id,
  );
  const completed = new Set(rows.filter((row) => row.completed).map((row) => row.chapterId));

  const ordered = [...syllabus.chapters].sort((a, b) => a.order - b.order);
  return ordered.find((chapter) => !completed.has(chapter.id)) ?? ordered[ordered.length - 1];
}
