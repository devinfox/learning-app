import { MISSIONS, roomsFor } from "../content/mathMines";
import { createRng, seedFrom, type Rng } from "../lib/rng";
import { adjustBand, preferredFormat } from "../questions/difficulty";
import { generateQuestion } from "../questions/generate";
import { sanitize, type GeneratedQuestion, type HintStep, type SanitizedQuestion } from "../questions/types";
import type { Mission } from "../types";
import { renderBuddyAtlas, type BuddyAtlas } from "./buddyAtlas";
import type {
  AnswerRequest,
  AnswerVerdict,
  DungeonHost,
  GameProfile,
  NextQuestionRequest,
  RunInit,
  RunSummary,
} from "./types";

interface RunRecord {
  rng: Rng;
  counter: number;
  questions: Map<string, GeneratedQuestion>;
}

const PROFILE_KEY = "dd:v1:profile";

const atlasCache = new Map<string, BuddyAtlas>();

function lookOverride(): Record<string, string> {
  if (process.env.NODE_ENV === "production" || typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const override: Record<string, string> = {};
  for (const slot of ["eyes", "glow", "hair"]) {
    const value = params.get(slot);
    if (value) override[slot] = value;
  }
  return override;
}

async function equippedLook(): Promise<Record<string, string> | null> {
  const override = lookOverride();
  try {
    const response = await fetch("/api/companion", { credentials: "same-origin" });
    if (!response.ok) return Object.keys(override).length > 0 ? override : null;
    const payload = await response.json();
    const equipped = payload?.data?.companion?.equipped ?? null;
    if (!equipped) return Object.keys(override).length > 0 ? override : null;
    return { ...equipped, ...override };
  } catch {
    return Object.keys(override).length > 0 ? override : null;
  }
}

function defaultProfile(): GameProfile {
  return {
    displayName: "Explorer",
    reducedMotion: false,
    soundOn: true,
    readAloud: false,
  };
}

function readProfile(): GameProfile {
  if (typeof window === "undefined") return defaultProfile();
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    return raw ? { ...defaultProfile(), ...JSON.parse(raw) } : defaultProfile();
  } catch {
    return defaultProfile();
  }
}

function effectivenessFor(
  correct: boolean,
  skipped: boolean,
  attemptNumber: number,
  hintLevel: number,
): number {
  if (skipped) return 0.2;
  if (correct) {
    if (hintLevel > 0) return 0.7;
    return attemptNumber === 1 ? 1 : 0.85;
  }
  return attemptNumber >= 2 ? 0.35 : 0;
}

export function createLocalHost(): DungeonHost {
  const runs = new Map<string, RunRecord>();

  const requireRun = (runId: string): RunRecord => {
    const run = runs.get(runId);
    if (!run) throw new Error(`Unknown run ${runId}`);
    return run;
  };

  return {
    async getProfile(): Promise<GameProfile> {
      return readProfile();
    },

    async getBuddyAtlas(): Promise<BuddyAtlas | null> {
      if (typeof window === "undefined") return null;

      const equipped = await equippedLook();
      const key = JSON.stringify([
        equipped?.eyes ?? null,
        equipped?.glow ?? null,
        equipped?.hair ?? null,
      ]);

      const cached = atlasCache.get(key);
      if (cached) return cached;

      try {
        const atlas = await renderBuddyAtlas(equipped);
        atlasCache.set(key, atlas);
        return atlas;
      } catch (error) {
        console.warn("[dungeon-dash] buddy atlas failed, using the gladiator", error);
        return null;
      }
    },

    async listMissions(worldSlug: string): Promise<Mission[]> {
      return MISSIONS.filter((mission) => mission.worldSlug === worldSlug);
    },

    async startRun(missionId: string): Promise<RunInit> {
      const mission = MISSIONS.find((entry) => entry.id === missionId);
      if (!mission) throw new Error(`Unknown mission ${missionId}`);

      const runId = `run_${Date.now().toString(36)}`;
      const seed = seedFrom(runId);
      runs.set(runId, { rng: createRng(seed), counter: 0, questions: new Map() });

      return {
        runId,
        seed,
        mission,
        rooms: roomsFor(mission),
        band: mission.startingBand,
      };
    },

    async nextQuestion(request: NextQuestionRequest): Promise<SanitizedQuestion> {
      const run = requireRun(request.runId);
      const band = adjustBand(request.band, request.history);
      const format = preferredFormat(request.history, run.rng.pick(["fact", "array", "word"]));
      run.counter += 1;
      const question = generateQuestion(
        run.rng,
        band,
        `${request.runId}_q${run.counter}`,
        format,
      );
      run.questions.set(question.id, question);
      return sanitize(question);
    },

    async submitAnswer(request: AnswerRequest): Promise<AnswerVerdict> {
      const run = requireRun(request.runId);
      const question = run.questions.get(request.questionId);
      if (!question) throw new Error(`Unknown question ${request.questionId}`);

      const skipped = request.optionIndex === null;
      const correct = !skipped && request.optionIndex === question.correctIndex;
      const resolved = correct || skipped || request.attemptNumber >= 2;
      const effectiveness = effectivenessFor(
        correct,
        skipped,
        request.attemptNumber,
        request.hintLevel,
      );

      const nextHint =
        !resolved && request.hintLevel < question.hints.length
          ? question.hints[request.hintLevel]
          : null;

      return {
        correct,
        resolved,
        effectiveness,
        hint: nextHint,
        explanation: resolved ? question.explanation : null,
        correctIndex: resolved ? question.correctIndex : null,
        skillId: question.skillId,
        format: question.format,
      };
    },

    async requestHint(
      runId: string,
      questionId: string,
      level: number,
    ): Promise<HintStep | null> {
      const run = requireRun(runId);
      const question = run.questions.get(questionId);
      if (!question) return null;
      return question.hints[level] ?? null;
    },

    async completeRun(
      runId: string,
      summary: Omit<RunSummary, "runId">,
    ): Promise<RunSummary> {
      runs.delete(runId);

      if (typeof window !== "undefined") {
        try {
          await fetch("/api/arcade/plays", {
            method: "POST",
            credentials: "same-origin",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              gameId: "dungeon-dash",
              missionId: summary.missionId,
              roomsCleared: summary.roomsCleared,
              questionsAnswered: summary.questionsAnswered,
              questionsCorrect: summary.questionsCorrect,
              perfectAnswers: summary.perfectAnswers,
              heartsLeft: summary.heartsLeft,
            }),
          });
        } catch (error) {
          console.warn("[dungeon-dash] could not record the play", error);
        }
      }

      return { runId, ...summary };
    },
  };
}
