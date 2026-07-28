import { requireVerified } from "@/lib/auth/session";
import { handler, json, readJson } from "@/lib/http";
import { activationSchema } from "@/lib/schemas";
import { createChat } from "@/lib/services/chat";
import {
  assembleTutorContext,
  ensureBrief,
  greetingFor,
  isTutorEnabled,
  TUTOR_DISABLED_MESSAGE,
} from "@/lib/tutor";
import { ApiError } from "@/lib/http";

export const POST = handler(async (request: Request) => {
  if (!isTutorEnabled()) throw ApiError.forbidden(TUTOR_DISABLED_MESSAGE);

  const { user, profile } = await requireVerified();
  const body = await readJson(request, activationSchema);

  const context = await assembleTutorContext({
    profile,
    request: {
      surface: body.surface,
      band: body.band,
      subjectId: body.subjectId ?? null,
      lessonId: body.lessonId ?? null,
      slideIndex: body.slideIndex ?? null,
      question: body.question ?? null,
    },
  });

  if (body.subjectId) {
    void ensureBrief({ subjectId: body.subjectId }).catch((error) => {
      console.error("Tutor: course brief could not be started.", error);
    });
  }

  const chat = await createChat({
    userId: user.id,
    subjectId: body.subjectId ?? null,
    lessonId: body.lessonId ?? null,
  });

  return json({
    chatId: chat.id,
    greeting: greetingFor(context),
    context: {
      band: context.band,
      surface: context.surface,
      subjectName: context.subjectName,
      lessonTitle: context.lessonTitle,
      memoryCount: context.memories.length,
      briefStatus: context.brief?.status ?? null,
    },
  }, { status: 201 });
});
