import { requireVerified } from "@/lib/auth/session";
import { handler, json, noContent } from "@/lib/http";
import { deleteChat, getChat, getMessages } from "@/lib/services/chat";

export const GET = handler(
  async (_request: Request, ctx: RouteContext<"/api/chats/[chatId]">) => {
    const { user } = await requireVerified();
    const { chatId } = await ctx.params;

    const chat = await getChat(user.id, chatId);
    const messages = await getMessages(user.id, chatId);

    return json({ chat, messages });
  },
);

export const DELETE = handler(
  async (_request: Request, ctx: RouteContext<"/api/chats/[chatId]">) => {
    const { user } = await requireVerified();
    const { chatId } = await ctx.params;
    await deleteChat(user.id, chatId);
    return noContent();
  },
);
