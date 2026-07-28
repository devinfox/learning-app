import { requireVerified } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { ApiError, handler, json, noContent } from "@/lib/http";
import { getEnrollment } from "@/lib/services/enrollment";
import { removeSubject } from "@/lib/services/enrollment";
import { chapterProgress, summariseSyllabusProgress } from "@/lib/services/progress";
import { subjectMastery, weekStats } from "@/lib/services/mastery";

export const GET = handler(
  async (_request: Request, ctx: RouteContext<"/api/me/subjects/[subjectId]">) => {
    const { user } = await requireVerified();
    const { subjectId } = await ctx.params;

    const enrollment = await getEnrollment(user.id, subjectId);
    const subject = await db.subjects.get(subjectId);
    if (!subject) throw ApiError.notFound("That subject doesn't exist.");

    const syllabus = enrollment.syllabusId
      ? await db.syllabi.get(enrollment.syllabusId)
      : null;

    return json({
      subject,
      enrollment: {
        id: enrollment.id,
        placementStatus: enrollment.placementStatus,
        placementScore: enrollment.placementScore,
        level: enrollment.level,
      },
      syllabus: syllabus
        ? {
            id: syllabus.id,
            title: syllabus.title,
            level: syllabus.level,
            status: syllabus.status,
            error: syllabus.error,
            chapters: [...syllabus.chapters].sort((a, b) => a.order - b.order),
            glossary: syllabus.glossary,
            timeline: syllabus.timeline,
          }
        : null,
      chapterProgress: syllabus ? await chapterProgress(user.id, syllabus) : {},
      progress: await summariseSyllabusProgress(user.id, syllabus),
      mastery: syllabus ? await subjectMastery(user.id, syllabus) : null,
      week: await weekStats(user.id),
    });
  },
);

export const DELETE = handler(
  async (_request: Request, ctx: RouteContext<"/api/me/subjects/[subjectId]">) => {
    const { user } = await requireVerified();
    const { subjectId } = await ctx.params;
    await removeSubject(user.id, subjectId);
    return noContent();
  },
);
