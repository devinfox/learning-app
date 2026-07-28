import type { ResponseInputItem } from "openai/resources/responses/responses";
import type { Message } from "@/lib/db/types";
import { isTutorEnabled } from "@/lib/tutor/config";
import { buildTutorSystemPrompt } from "@/lib/tutor/prompt";
import type { TutorContext } from "@/lib/tutor/types";
import { MODEL, getClient, isAiEnabled } from "./client";

export type { TutorContext };

function toInput(history: Message[]): ResponseInputItem[] {
  return history.map((message) => ({
    type: "message",
    role: message.role,
    content: message.attachments.length
      ? `${message.content}\n\n[Attached: ${message.attachments.map((a) => a.name).join(", ")}]`
      : message.content,
  }));
}

export async function* streamTutorReply(params: {
  history: Message[];
  context: TutorContext;
}): AsyncGenerator<string> {
  if (!isTutorEnabled()) {
    yield "The UVBrain teacher is currently unavailable.";
    return;
  }

  if (!isAiEnabled()) {
    yield* scriptedReply(params);
    return;
  }

  const stream = getClient().responses.stream({
    model: MODEL,
    instructions: buildTutorSystemPrompt(params.context),
    input: toInput(params.history),
    reasoning: { effort: "low" },
    max_output_tokens: 2048,
  });

  let refused = false;

  for await (const event of stream) {
    if (event.type === "response.output_text.delta") {
      yield event.delta;
    } else if (event.type === "response.refusal.delta") {
      refused = true;
    }
  }

  if (refused) {
    yield "\n\nThat's not something I can help with — let's stay on the coursework.";
  }
}

async function* scriptedReply(params: {
  history: Message[];
  context: TutorContext;
}): AsyncGenerator<string> {
  const question = [...params.history].reverse().find((m) => m.role === "user");
  const topic =
    params.context.lessonTitle ?? params.context.subjectName ?? "this topic";

  const surfaceNote =
    params.context.surface === "practice_test"
      ? "You're mid-test, so I wouldn't give you the answer anyway — I'd help you reason toward it."
      : `I'd normally dig into ${topic} with you here.`;

  const reply = [
    "Good question — let's take it in order.",
    "",
    question ? `You asked: "${truncate(question.content, 140)}"` : `Ask me anything about ${topic}.`,
    "",
    `I'm running without an OpenAI API key, so this is a scripted reply. ${surfaceNote}`,
    "",
    `Everything around it is live: I know you're in ${params.context.band} band on the ${params.context.surface} surface, I'm holding ${params.context.memories.length} thing(s) I've learned about you, and this message is being saved to your history.`,
  ].join("\n");

  for (const chunk of reply.match(/[\s\S]{1,12}/g) ?? []) {
    await new Promise((resolve) => setTimeout(resolve, 15));
    yield chunk;
  }
}

function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}

export function deriveChatTitle(firstMessage: string): string {
  const cleaned = firstMessage.replace(/\s+/g, " ").trim();
  if (!cleaned) return "New chat";
  return cleaned.length <= 48 ? cleaned : `${cleaned.slice(0, 47)}…`;
}
