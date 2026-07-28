import { requireVerified } from "@/lib/auth/session";
import { handler, json, readJson } from "@/lib/http";
import { createChatSchema } from "@/lib/schemas";
import { createChat, listChats } from "@/lib/services/chat";

export const GET = handler(async () => {
  const { user } = await requireVerified();
  return json({ chats: await listChats(user.id) });
});

export const POST = handler(async (request: Request) => {
  const { user } = await requireVerified();
  const body = await readJson(request, createChatSchema);

  const chat = await createChat({
    userId: user.id,
    subjectId: body.subjectId ?? null,
    lessonId: body.lessonId ?? null,
  });

  return json({ chat }, { status: 201 });
});
