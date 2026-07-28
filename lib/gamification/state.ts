import { isFreeLookId, isLookSlot } from "@/lib/companion/looks";
import { db, newId, now } from "@/lib/db";
import type { CompanionState } from "@/lib/db/types";
import { ApiError } from "@/lib/http";
import { rewardById } from "./catalog";
import { earnedIds, rewardLedger } from "./ledger";
import { isRoomSlot, type RewardLedger } from "./types";

export async function getCompanionState(userId: string): Promise<CompanionState> {
  const existing = await db.companionStates.findOne((row) => row.userId === userId);
  if (existing) return existing;

  const created: CompanionState = {
    id: newId("cmp"),
    userId,
    equipped: {},
    room: {},
    seenRewardIds: [],
    nickname: null,
    updatedAt: now(),
  };
  await db.companionStates.insert(created);
  return created;
}

export interface CompanionView {
  state: CompanionState;
  ledger: RewardLedger;
}

export async function getCompanion(userId: string): Promise<CompanionView> {
  const [state, ledger] = await Promise.all([
    getCompanionState(userId),
    rewardLedger(userId),
  ]);
  return { state, ledger };
}

export async function equip(params: {
  userId: string;
  slot: string;
  rewardId: string | null;
}): Promise<CompanionState> {
  const state = await getCompanionState(params.userId);

  // Free Lottie cosmetics (eyes / glow / hair) — always unlocked
  if (isLookSlot(params.slot)) {
    if (params.rewardId !== null && !isFreeLookId(params.rewardId)) {
      throw ApiError.notFound("That look doesn't exist.");
    }
    const next = { ...state.equipped };
    if (params.rewardId === null) delete next[params.slot];
    else next[params.slot] = params.rewardId;
    return (
      (await db.companionStates.update(state.id, {
        equipped: next,
        updatedAt: now(),
      })) ?? state
    );
  }

  if (params.rewardId !== null) {
    const reward = rewardById(params.rewardId);
    if (!reward) throw ApiError.notFound("That item doesn't exist.");
    if (reward.slot !== params.slot) {
      throw ApiError.badRequest(`${reward.name} doesn't go in that slot.`);
    }

    const owned = earnedIds(await rewardLedger(params.userId));
    if (!owned.has(reward.id)) {
      throw ApiError.forbidden("That one isn't unlocked yet.");
    }
  }

  const target = isRoomSlot(params.slot as never) ? "room" : "equipped";
  const next = { ...state[target] };

  if (params.rewardId === null) delete next[params.slot];
  else next[params.slot] = params.rewardId;

  return (
    (await db.companionStates.update(state.id, { [target]: next, updatedAt: now() })) ??
    state
  );
}

export async function markSeen(userId: string, rewardIds: string[]): Promise<CompanionState> {
  const state = await getCompanionState(userId);
  const merged = new Set([...state.seenRewardIds, ...rewardIds]);

  return (
    (await db.companionStates.update(state.id, {
      seenRewardIds: [...merged],
      updatedAt: now(),
    })) ?? state
  );
}

export async function setNickname(userId: string, nickname: string): Promise<CompanionState> {
  const state = await getCompanionState(userId);
  const trimmed = nickname.trim().slice(0, 24);

  return (
    (await db.companionStates.update(state.id, {
      nickname: trimmed.length > 0 ? trimmed : null,
      updatedAt: now(),
    })) ?? state
  );
}
