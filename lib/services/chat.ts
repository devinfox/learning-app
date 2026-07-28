import { deriveChatTitle, streamTutorReply } from "@/lib/ai/tutor";
import { db, newId, now } from "@/lib/db";
import type { Attachment, Chat, Message, Profile } from "@/lib/db/types";
import { ApiError } from "@/lib/http";
import { assembleTutorContext, type ActivationRequest } from "@/lib/tutor/context";
import { extractMemoriesFromExchange } from "@/lib/tutor/memory";
import { detectEscalation } from "@/lib/tutor/safeguarding";
import type { TutorContext } from "@/lib/tutor/types";

export interface ChatSummary {
  id: string;
  title: string;
  subjectId: string | null;
  lessonId: string | null;
  messageCount: number;
  lastMessageAt: string;
  updatedAt: string;
}

export async function listChats(userId: string): Promise<ChatSummary[]> {
  const chats = await db.chats.find((chat) => chat.userId === userId);
  const messages = await db.messages.all();

  return chats
    .map((chat) => {
      const own = messages.filter((message) => message.chatId === chat.id);
      const last = own[own.length - 1];
      return {
        id: chat.id,
        title: chat.title,
        subjectId: chat.subjectId,
        lessonId: chat.lessonId,
        messageCount: own.length,
        lastMessageAt: last?.createdAt ?? chat.createdAt,
        updatedAt: chat.updatedAt,
      };
    })
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

export async function createChat(params: {
  userId: string;
  subjectId?: string | null;
  lessonId?: string | null;
}): Promise<Chat> {
  const chat: Chat = {
    id: newId("cht"),
    userId: params.userId,
    title: "New chat",
    subjectId: params.subjectId ?? null,
    lessonId: params.lessonId ?? null,
    createdAt: now(),
    updatedAt: now(),
  };
  await db.chats.insert(chat);
  return chat;
}

export async function getChat(userId: string, chatId: string): Promise<Chat> {
  const chat = await db.chats.get(chatId);
  if (!chat) throw ApiError.notFound("Chat not found.");
  if (chat.userId !== userId) throw ApiError.forbidden();
  return chat;
}

export async function getMessages(userId: string, chatId: string): Promise<Message[]> {
  await getChat(userId, chatId);
  const messages = await db.messages.find((message) => message.chatId === chatId);
  return messages.sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
}

export async function deleteChat(userId: string, chatId: string): Promise<void> {
  const chat = await getChat(userId, chatId);
  await db.messages.removeWhere((message) => message.chatId === chat.id);
  await db.chats.remove(chat.id);
}

async function buildContext(
  profile: Profile,
  chat: Chat,
  activation?: ActivationRequest,
): Promise<TutorContext> {
  const exchangeCount = (
    await db.messages.find((message) => message.chatId === chat.id)
  ).length;

  return assembleTutorContext({
    profile,
    request: {
      ...(activation ?? {
        surface: chat.lessonId ? "lesson" : "free",
        subjectId: chat.subjectId,
        lessonId: chat.lessonId,
      }),
      exchangeCount,
    },
  });
}

export interface SendResult {
  userMessage: Message;
  stream: AsyncGenerator<string>;
  completion: Promise<Message>;
}

export async function sendMessage(params: {
  userId: string;
  profile: Profile;
  chatId: string;
  content: string;
  attachments?: Attachment[];
  viaVoice?: boolean;
  activation?: ActivationRequest;
}): Promise<SendResult> {
  const chat = await getChat(params.userId, params.chatId);

  const userMessage: Message = {
    id: newId("msg"),
    chatId: chat.id,
    role: "user",
    content: params.content,
    attachments: params.attachments ?? [],
    viaVoice: params.viaVoice ?? false,
    createdAt: now(),
  };
  await db.messages.insert(userMessage);

  const history = await getMessages(params.userId, chat.id);

  if (chat.title === "New chat") {
    await db.chats.update(chat.id, {
      title: deriveChatTitle(params.content),
      updatedAt: now(),
    });
  } else {
    await db.chats.update(chat.id, { updatedAt: now() });
  }

  const context = await buildContext(params.profile, chat, params.activation);

  const escalation = detectEscalation(params.content);
  if (escalation.triggered) {
    console.warn(
      `[safeguarding] signal in chat ${chat.id} for user ${params.userId}:`,
      escalation.matched,
    );
  }

  let resolve!: (message: Message) => void;
  let reject!: (error: unknown) => void;
  const completion = new Promise<Message>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  async function* pump(): AsyncGenerator<string> {
    const parts: string[] = [];
    try {
      for await (const chunk of streamTutorReply({ history, context })) {
        parts.push(chunk);
        yield chunk;
      }
      const assistantMessage: Message = {
        id: newId("msg"),
        chatId: chat.id,
        role: "assistant",
        content: parts.join(""),
        attachments: [],
        viaVoice: false,
        createdAt: now(),
      };
      await db.messages.insert(assistantMessage);
      await db.chats.update(chat.id, { updatedAt: now() });
      resolve(assistantMessage);

      void extractMemoriesFromExchange({
        userId: params.userId,
        subjectId: chat.subjectId,
        chatId: chat.id,
        learnerMessage: params.content,
        tutorReply: assistantMessage.content,
      }).catch((error) => console.error("[tutor] memory extraction:", error));
    } catch (error) {
      reject(error);
      throw error;
    }
  }

  return { userMessage, stream: pump(), completion };
}
