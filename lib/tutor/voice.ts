import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { speechText } from "./speech-text";
import type { GradeBand } from "./types";
import { buildCueTrack, type CharacterTiming, type VisemeCue } from "./visemes";

export const DEFAULT_VOICE_ID =
  process.env.ELEVENLABS_VOICE_ID ?? "cgSgspJ2msm6clMCkdW9";

export const DEFAULT_TTS_MODEL = process.env.ELEVENLABS_MODEL_ID ?? "eleven_turbo_v2_5";

let client: ElevenLabsClient | null = null;

export function isVoiceEnabled(): boolean {
  return Boolean(process.env.ELEVENLABS_API_KEY);
}

function getClient(): ElevenLabsClient {
  if (!isVoiceEnabled()) throw new Error("ELEVENLABS_API_KEY is not set");
  client ??= new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
  return client;
}

const BAND_VOICE_SETTINGS: Record<GradeBand, { stability: number; speed: number }> = {
  early: { stability: 0.35, speed: 0.85 },
  elementary: { stability: 0.4, speed: 0.92 },
  middle: { stability: 0.45, speed: 1.0 },
  high: { stability: 0.5, speed: 1.0 },
  college: { stability: 0.5, speed: 1.05 },
};

export interface SpokenReply {
  audioBase64: string;
  mimeType: string;
  cues: VisemeCue[];
  voiceId: string;
  model: string;
}

export async function speak(params: {
  text: string;
  band: GradeBand;
  voiceId?: string;
}): Promise<SpokenReply> {
  const voiceId = params.voiceId ?? DEFAULT_VOICE_ID;
  const settings = BAND_VOICE_SETTINGS[params.band];

  const text = speechText(params.text);
  if (text.length === 0) {
    throw new Error("Nothing to speak once formatting was removed.");
  }

  const response = await getClient().textToSpeech.convertWithTimestamps(voiceId, {
    text,
    modelId: DEFAULT_TTS_MODEL,
    outputFormat: "mp3_44100_128",
    voiceSettings: {
      stability: settings.stability,
      speed: settings.speed,
      similarityBoost: 0.75,
    },
  });

  const alignment = response.normalizedAlignment ?? response.alignment;

  const timings: CharacterTiming[] = alignment
    ? alignment.characters.map((character, index) => ({
        character,
        startMs: (alignment.characterStartTimesSeconds[index] ?? 0) * 1000,
        endMs: (alignment.characterEndTimesSeconds[index] ?? 0) * 1000,
      }))
    : [];

  const spokenText = timings.map((timing) => timing.character).join("") || text;

  return {
    audioBase64: response.audioBase64,
    mimeType: "audio/mpeg",
    cues: timings.length > 0 ? buildCueTrack(spokenText, timings) : [],
    voiceId,
    model: DEFAULT_TTS_MODEL,
  };
}

export async function listVoices() {
  const response = await getClient().voices.search({ pageSize: 100 });
  return (response.voices ?? []).map((voice) => ({
    voiceId: voice.voiceId,
    name: voice.name,
    labels: voice.labels ?? {},
    previewUrl: voice.previewUrl,
  }));
}
