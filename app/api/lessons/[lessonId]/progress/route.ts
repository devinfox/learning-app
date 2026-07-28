import { requireVerified } from "@/lib/auth/session";
import { handler, json, readJson } from "@/lib/http";
import { slideProgressSchema } from "@/lib/schemas";
import { recordSlideProgress } from "@/lib/services/progress";

export const PATCH = handler(
  async (request: Request, ctx: RouteContext<"/api/lessons/[lessonId]/progress">) => {
    const { user } = await requireVerified();
    const { lessonId } = await ctx.params;
    const { slideIndex } = await readJson(request, slideProgressSchema);

    const progress = await recordSlideProgress({ userId: user.id, lessonId, slideIndex });

    return json({
      progress: {
        slideIndex: progress.slideIndex,
        slideCount: progress.slideCount,
        completed: progress.completed,
        percent:
          progress.slideCount > 0
            ? Math.round((progress.slideIndex / progress.slideCount) * 100)
            : 0,
      },
    });
  },
);
