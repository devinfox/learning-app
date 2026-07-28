import { ApiClientError, apiPost } from "@/lib/api";
import { takeOversizedClause, takeSentences } from "@/lib/tutor/sentences";
import type { GradeBand } from "@/lib/tutor/types";
import type { VisemeCue } from "@/lib/tutor/visemes";

export type SpeakEnqueue = (reply: {
  audioBase64: string;
  cues: VisemeCue[];
}) => void;

export interface StreamSpeakOptions {
  band: GradeBand;
  voiceOn: boolean;
  voiceBlocked: boolean;
  enqueue: SpeakEnqueue;
  onVoiceUnavailable?: () => void;
  onDraft?: (text: string) => void;
}

export function createSentenceSpeaker(options: StreamSpeakOptions) {
  let buffer = "";
  let full = "";
  let chain: Promise<void> = Promise.resolve();
  let stopped = false;

  const speakChunk = (text: string) => {
    const piece = text.trim();
    if (!piece || !options.voiceOn || options.voiceBlocked || stopped) return;

    chain = chain.then(async () => {
      if (stopped || !options.voiceOn || options.voiceBlocked) return;
      try {
        const reply = await apiPost<{ audioBase64: string; cues: VisemeCue[] }>(
          "/api/tutor/speak",
          { text: piece, band: options.band },
        );
        if (stopped) return;
        options.enqueue(reply);
      } catch (error) {
        if (error instanceof ApiClientError && error.status === 503) {
          options.onVoiceUnavailable?.();
        }
      }
    });
  };

  const push = (delta: string) => {
    if (stopped || !delta) return;
    full += delta;
    buffer += delta;
    options.onDraft?.(full);

    const { sentences, rest } = takeSentences(buffer);
    buffer = rest;
    for (const sentence of sentences) speakChunk(sentence);

    const oversized = takeOversizedClause(buffer);
    if (oversized.sentence) {
      speakChunk(oversized.sentence);
      buffer = oversized.rest;
    }
  };

  const flush = async () => {
    const tail = buffer.trim();
    buffer = "";
    if (tail) speakChunk(tail);
    await chain;
  };

  const cancel = () => {
    stopped = true;
  };

  return {
    push,
    flush,
    cancel,
    get text() {
      return full;
    },
  };
}
