import type { AnswerVerdict, RunInit } from "../host/types";
import type { AttemptRecord } from "../questions/difficulty";
import type { HintStep, SanitizedQuestion } from "../questions/types";
import type { ActionId, EnemyState, RoomTemplate } from "../types";

export type Phase =
  | "booting"
  | "roomIntro"
  | "choosingAction"
  | "answering"
  | "playingMove"
  | "enemyTurn"
  | "roomOutro"
  | "runComplete";

export interface RunStats {
  roomsCleared: number;
  enemiesDefeated: number;
  questionsAnswered: number;
  questionsCorrect: number;
  perfectAnswers: number;
  correctedAnswers: number;
  assists: number;
}

export interface RunState {
  phase: Phase;
  runId: string;
  seed: number;
  missionId: string;
  missionTitle: string;
  rooms: RoomTemplate[];
  roomIndex: number;
  hearts: number;
  power: number;
  band: number;
  enemies: EnemyState[];
  objective: number;
  questionIndex: number;
  question: SanitizedQuestion | null;
  questionLoading: boolean;
  pendingAction: ActionId | null;
  attempt: number;
  hintLevel: number;
  hint: HintStep | null;
  eliminated: number[];
  revealedIndex: number | null;
  explanation: string | null;
  lastEffectiveness: number;
  countered: boolean;
  assisted: boolean;
  rescued: boolean;
  history: AttemptRecord[];
  stats: RunStats;
  announcement: string;
}

export type RunEvent =
  | { type: "START"; init: RunInit }
  | { type: "INTRO_DONE" }
  | { type: "CHOOSE_ACTION"; action: ActionId }
  | { type: "QUESTION_READY"; question: SanitizedQuestion }
  | { type: "HINT_READY"; hint: HintStep }
  | { type: "VERDICT"; verdict: AnswerVerdict; responseMs: number }
  | { type: "MOVE_DONE" }
  | { type: "ENEMY_DONE" }
  | { type: "ADVANCE" };
