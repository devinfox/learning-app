import type { AttemptRecord } from "../questions/difficulty";
import type { BuddyAtlas } from "./buddyAtlas";
import type { HintStep, SanitizedQuestion } from "../questions/types";
import type { ActionId, Mission, QuestionFormat, RoomTemplate } from "../types";

export interface GameProfile {
  displayName: string;
  reducedMotion: boolean;
  soundOn: boolean;
  readAloud: boolean;
}

export interface RunInit {
  runId: string;
  seed: number;
  mission: Mission;
  rooms: RoomTemplate[];
  band: number;
}

export interface NextQuestionRequest {
  runId: string;
  roomId: string;
  action: ActionId;
  band: number;
  history: AttemptRecord[];
}

export interface AnswerRequest {
  runId: string;
  questionId: string;
  optionIndex: number | null;
  attemptNumber: number;
  hintLevel: number;
  responseMs: number;
}

export interface AnswerVerdict {
  correct: boolean;
  resolved: boolean;
  effectiveness: number;
  hint: HintStep | null;
  explanation: string | null;
  correctIndex: number | null;
  skillId: string;
  format: QuestionFormat;
}

export interface RunSummary {
  runId: string;
  missionId: string;
  roomsCleared: number;
  enemiesDefeated: number;
  questionsAnswered: number;
  questionsCorrect: number;
  perfectAnswers: number;
  correctedAnswers: number;
  heartsLeft: number;
}

export interface DungeonHost {
  getProfile(): Promise<GameProfile>;
  getBuddyAtlas(): Promise<BuddyAtlas | null>;
  listMissions(worldSlug: string): Promise<Mission[]>;
  startRun(missionId: string): Promise<RunInit>;
  nextQuestion(request: NextQuestionRequest): Promise<SanitizedQuestion>;
  submitAnswer(request: AnswerRequest): Promise<AnswerVerdict>;
  requestHint(runId: string, questionId: string, level: number): Promise<HintStep | null>;
  completeRun(runId: string, summary: Omit<RunSummary, "runId">): Promise<RunSummary>;
}
