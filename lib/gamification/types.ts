import type { LucideIcon } from "lucide-react";

export type CompanionSlot = "hat" | "held" | "aura" | "badge";

export type RoomSlot = "backdrop" | "floor" | "shelf" | "wall" | "pet";

export type RewardSlot = CompanionSlot | RoomSlot;

export const COMPANION_SLOTS: CompanionSlot[] = ["hat", "held", "aura", "badge"];
export const ROOM_SLOTS: RoomSlot[] = ["backdrop", "floor", "shelf", "wall", "pet"];

export function isRoomSlot(slot: RewardSlot): slot is RoomSlot {
  return (ROOM_SLOTS as string[]).includes(slot);
}

export type Trigger =
  | { kind: "chapter"; subjectSlug: string; chapterOrder: number }
  | { kind: "subject_complete"; subjectSlug: string }
  | { kind: "chapters_total"; count: number }
  | { kind: "quiz_retry" }
  | { kind: "return_after_absence"; days: number }
  | { kind: "active_weeks"; count: number }
  | { kind: "mastery"; tier: "radiant" | "prism" }
  | { kind: "lesson_thorough"; count: number };

export interface Reward {
  id: string;
  name: string;
  blurb: string;
  slot: RewardSlot;
  icon: LucideIcon;
  tone: "brand" | "ray1" | "ray2" | "ray3" | "ray4" | "lumen";
  trigger: Trigger;
  subjectSlug?: string;
}

export interface EarnedReward {
  reward: Reward;
  earnedAt: string;
  reason: string;
}

export interface LockedReward {
  reward: Reward;
  requirement: string;
  progress: number | null;
}

export interface RewardLedger {
  earned: EarnedReward[];
  locked: LockedReward[];
  unseen: EarnedReward[];
}
