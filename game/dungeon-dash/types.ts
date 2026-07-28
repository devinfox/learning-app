export type ActionId = "attack" | "shield" | "surge";

export type EnemyIntent = "heavy" | "charge" | "swarm";

export type HeroPose =
  | "idle"
  | "enter"
  | "attack"
  | "guard"
  | "cast"
  | "hurt"
  | "celebrate";

export type EnemyReaction = "telegraph" | "hit" | "shrug" | "defeat" | "strike";

export type RoomType = "battle" | "trap" | "treasure" | "boss";

export type ActionIconId =
  | "swords"
  | "shield"
  | "sparkles"
  | "hammer"
  | "anchor"
  | "zap";

export type QuestionFormat = "fact" | "array" | "word";

export interface EnemySpec {
  id: string;
  name: string;
  resolve: number;
  palette: { body: string; shade: string; accent: string };
  shape: "goblin" | "slime" | "mole";
  intents: EnemyIntent[];
}

export interface RoomTemplate {
  id: string;
  type: RoomType;
  title: string;
  premise: string;
  questionCount: number;
  enemyIds: string[];
  objectiveLabel: string;
  backdrop: string;
  actionKit: string;
}

export interface Mission {
  id: string;
  worldSlug: string;
  title: string;
  premise: string;
  skillLabel: string;
  estimatedMinutes: number;
  roomIds: string[];
  startingBand: number;
}

export interface EnemyState {
  key: string;
  specId: string;
  name: string;
  resolve: number;
  maxResolve: number;
  intent: EnemyIntent;
  alive: boolean;
}

export const COUNTERS: Record<EnemyIntent, ActionId> = {
  heavy: "shield",
  charge: "attack",
  swarm: "surge",
};

export const INTENT_TELL: Record<EnemyIntent, string> = {
  heavy: "winding up a heavy swing",
  charge: "charging straight at you",
  swarm: "splitting into a swarm",
};

export interface ActionSpec {
  id: ActionId;
  name: string;
  blurb: string;
  pose: HeroPose;
  requiresFullPower: boolean;
}

export const ACTIONS: ActionSpec[] = [
  {
    id: "attack",
    name: "Strike",
    blurb: "Interrupts an enemy that is charging.",
    pose: "attack",
    requiresFullPower: false,
  },
  {
    id: "shield",
    name: "Shield",
    blurb: "Blocks a heavy swing before it lands.",
    pose: "guard",
    requiresFullPower: false,
  },
  {
    id: "surge",
    name: "Surge",
    blurb: "Hits everything at once. Needs a full meter.",
    pose: "cast",
    requiresFullPower: true,
  },
];

export const SURGE_MULTIPLIER = 1.6;
export const MAX_HEARTS = 4;
export const MAX_POWER = 100;
