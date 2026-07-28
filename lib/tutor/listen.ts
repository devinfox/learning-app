import { getClient, isAiEnabled } from "@/lib/ai/client";
import type { GradeBand } from "./types";

export const TRANSCRIBE_MODEL =
  process.env.OPENAI_TRANSCRIBE_MODEL ?? "gpt-4o-transcribe";

export function isListeningEnabled(): boolean {
  return isAiEnabled();
}

function transcriptionHint(params: {
  band: GradeBand;
  subjectName: string | null;
  lessonTitle: string | null;
  keyTerms: string[];
}): string {
  const parts: string[] = [];

  if (params.band === "early" || params.band === "elementary") {
    parts.push(
      "A young child speaking to a study helper. Speech may be slow, restarted, or hesitant.",
    );
  } else {
    parts.push("A student asking a study question.");
  }

  if (params.subjectName) parts.push(`Subject: ${params.subjectName}.`);
  if (params.lessonTitle) parts.push(`Lesson: ${params.lessonTitle}.`);
  if (params.keyTerms.length > 0) {
    parts.push(`Terms that may come up: ${params.keyTerms.slice(0, 40).join(", ")}.`);
  }

  return parts.join(" ");
}

export interface HeardSpeech {
  text: string;
  model: string;
}

export async function listen(params: {
  audio: File;
  band: GradeBand;
  subjectName?: string | null;
  lessonTitle?: string | null;
  keyTerms?: string[];
  language?: string | null;
}): Promise<HeardSpeech> {
  if (!isListeningEnabled()) throw new Error("OPENAI_API_KEY is not set");

  const response = await getClient().audio.transcriptions.create({
    file: params.audio,
    model: TRANSCRIBE_MODEL,
    language: params.language ?? undefined,
    prompt: transcriptionHint({
      band: params.band,
      subjectName: params.subjectName ?? null,
      lessonTitle: params.lessonTitle ?? null,
      keyTerms: params.keyTerms ?? [],
    }),
  });

  return { text: response.text.trim(), model: TRANSCRIBE_MODEL };
}
