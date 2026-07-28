import { requireVerified } from "@/lib/auth/session";
import { ApiError, handler, json, readJson } from "@/lib/http";
import { checkInteractiveSchema } from "@/lib/schemas";
import { getLesson } from "@/lib/services/courses";
import { recordInteractiveAttempt } from "@/lib/services/progress";

export const POST = handler(
  async (
    request: Request,
    ctx: RouteContext<"/api/lessons/[lessonId]/interactives/[interactiveId]/check">,
  ) => {
    const { user } = await requireVerified();
    const { lessonId, interactiveId } = await ctx.params;
    const { answer } = await readJson(request, checkInteractiveSchema);

    const lesson = await getLesson(user.id, lessonId);
    const interactive = lesson.slides
      .map((slide) => slide.interactive)
      .find((candidate) => candidate?.id === interactiveId);

    if (!interactive) throw ApiError.notFound("That practice question doesn't exist.");

    const correct =
      answer.length === interactive.answer.length &&
      answer.every((value, index) => value === interactive.answer[index]);

    await recordInteractiveAttempt({
      userId: user.id,
      lessonId: lesson.id,
      interactiveId: interactive.id,
    });

    return json({
      correct,
      correctAnswer: interactive.answer,
      explanation: interactive.explanation,
    });
  },
);
