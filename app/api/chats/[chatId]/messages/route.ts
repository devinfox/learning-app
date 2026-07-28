import { requireVerified } from "@/lib/auth/session";
import { handler, json, readJson } from "@/lib/http";
import { sendMessageSchema } from "@/lib/schemas";
import { getMessages, sendMessage } from "@/lib/services/chat";

export const GET = handler(
  async (_request: Request, ctx: RouteContext<"/api/chats/[chatId]/messages">) => {
    const { user } = await requireVerified();
    const { chatId } = await ctx.params;
    return json({ messages: await getMessages(user.id, chatId) });
  },
);

export const POST = handler(
  async (request: Request, ctx: RouteContext<"/api/chats/[chatId]/messages">) => {
    const { user, profile } = await requireVerified();
    const { chatId } = await ctx.params;
    const body = await readJson(request, sendMessageSchema);

    const { userMessage, stream, completion } = await sendMessage({
      userId: user.id,
      profile,
      chatId,
      content: body.content,
      attachments: body.attachments,
      viaVoice: body.viaVoice,
      activation: body.activation,
    });

    const encoder = new TextEncoder();
    const sse = new ReadableStream({
      async start(controller) {
        const send = (event: string, data: unknown) => {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
          );
        };

        send("user_message", { message: userMessage });

        try {
          for await (const chunk of stream) {
            send("delta", { text: chunk });
          }
          send("done", { message: await completion });
        } catch (error) {
          console.error("Tutor stream failed:", error);
          send("error", {
            message: "The tutor couldn't finish that reply. Try again.",
          });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(sse, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  },
);
