import { requireVerified } from "@/lib/auth/session";
import { handler, json } from "@/lib/http";
import { ensureLesson } from "@/lib/services/courses";

export const POST = handler(
  async (
    _request: Request,
    ctx: RouteContext<"/api/syllabi/[syllabusId]/chapters/[chapterId]/lesson">,
  ) => {
    const { user } = await requireVerified();
    const { syllabusId, chapterId } = await ctx.params;

    const lesson = await ensureLesson({ userId: user.id, syllabusId, chapterId });

    return json({
      lesson: {
        id: lesson.id,
        title: lesson.title,
        status: lesson.status,
        error: lesson.error,
        slideCount: lesson.slides.length,
      },
    });
  },
);
