import { requireVerified } from "@/lib/auth/session";
import { handler, json } from "@/lib/http";
import { getSubject } from "@/lib/services/catalog";
import { getSyllabus } from "@/lib/services/courses";
import { chapterProgress, summariseSyllabusProgress } from "@/lib/services/progress";

export const GET = handler(
  async (_request: Request, ctx: RouteContext<"/api/syllabi/[syllabusId]">) => {
    const { user } = await requireVerified();
    const { syllabusId } = await ctx.params;

    const syllabus = await getSyllabus(user.id, syllabusId);
    const subject = await getSubject(syllabus.subjectId);

    return json({
      syllabus: {
        id: syllabus.id,
        title: syllabus.title,
        level: syllabus.level,
        status: syllabus.status,
        error: syllabus.error,
        chapters: [...syllabus.chapters].sort((a, b) => a.order - b.order),
      },
      subject,
      chapterProgress: await chapterProgress(user.id, syllabus),
      progress: await summariseSyllabusProgress(user.id, syllabus),
    });
  },
);
