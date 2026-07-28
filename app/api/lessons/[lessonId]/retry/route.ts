import { requireVerified } from "@/lib/auth/session";
import { handler, json } from "@/lib/http";
import { retryLesson } from "@/lib/services/courses";

export const POST = handler(
  async (_request: Request, ctx: RouteContext<"/api/lessons/[lessonId]/retry">) => {
    const { user } = await requireVerified();
    const { lessonId } = await ctx.params;
    const lesson = await retryLesson(user.id, lessonId);
    return json({ lesson: { id: lesson.id, status: lesson.status } });
  },
);
