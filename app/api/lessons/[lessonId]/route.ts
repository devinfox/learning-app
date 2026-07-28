import { requireVerified } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { handler, json } from "@/lib/http";
import { getLesson } from "@/lib/services/courses";

export const GET = handler(
  async (_request: Request, ctx: RouteContext<"/api/lessons/[lessonId]">) => {
    const { user } = await requireVerified();
    const { lessonId } = await ctx.params;

    const lesson = await getLesson(user.id, lessonId);
    const syllabus = await db.syllabi.get(lesson.syllabusId);
    const progress = await db.progress.findOne(
      (row) => row.userId === user.id && row.lessonId === lesson.id,
    );

    return json({
      lesson: {
        id: lesson.id,
        title: lesson.title,
        status: lesson.status,
        error: lesson.error,
        subjectId: lesson.subjectId,
        syllabusId: lesson.syllabusId,
        chapterId: lesson.chapterId,
        quizId: lesson.quizId,
        slides: [...lesson.slides]
          .sort((a, b) => a.order - b.order)
          .map((slide) => ({
            id: slide.id,
            order: slide.order,
            heading: slide.heading,
            body: slide.body,
            image: slide.image,
            reading: slide.reading,
            interactive: slide.interactive
              ? {
                  id: slide.interactive.id,
                  kind: slide.interactive.kind,
                  prompt: slide.interactive.prompt,
                  options: slide.interactive.options,
                }
              : null,
          })),
      },
      glossary: syllabus?.glossary ?? [],
      progress: {
        slideIndex: progress?.slideIndex ?? 0,
        attemptedInteractiveIds: progress?.attemptedInteractiveIds ?? [],
        completed: progress?.completed ?? false,
        completedAt: progress?.completedAt ?? null,
      },
    });
  },
);
