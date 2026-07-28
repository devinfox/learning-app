import { requireVerified } from "@/lib/auth/session";
import { handler, json, readJson } from "@/lib/http";
import { equipSchema } from "@/lib/schemas";
import { equip, getCompanion, markSeen, setNickname } from "@/lib/gamification";

export const GET = handler(async () => {
  const { user } = await requireVerified();
  const { state, ledger } = await getCompanion(user.id);

  return json({
    companion: {
      equipped: state.equipped,
      room: state.room,
      nickname: state.nickname,
    },
    earned: ledger.earned.map((row) => ({
      id: row.reward.id,
      name: row.reward.name,
      blurb: row.reward.blurb,
      slot: row.reward.slot,
      tone: row.reward.tone,
      subjectSlug: row.reward.subjectSlug ?? null,
      earnedAt: row.earnedAt,
      reason: row.reason,
    })),
    locked: ledger.locked.map((row) => ({
      id: row.reward.id,
      name: row.reward.name,
      blurb: row.reward.blurb,
      slot: row.reward.slot,
      tone: row.reward.tone,
      subjectSlug: row.reward.subjectSlug ?? null,
      requirement: row.requirement,
      progress: row.progress,
    })),
    unseenIds: ledger.unseen.map((row) => row.reward.id),
  });
});

export const POST = handler(async (request: Request) => {
  const { user } = await requireVerified();
  const body = await readJson(request, equipSchema);

  if (body.kind === "equip") {
    await equip({ userId: user.id, slot: body.slot, rewardId: body.rewardId });
  } else if (body.kind === "seen") {
    await markSeen(user.id, body.rewardIds);
  } else {
    await setNickname(user.id, body.nickname);
  }

  const { state } = await getCompanion(user.id);
  return json({
    companion: {
      equipped: state.equipped,
      room: state.room,
      nickname: state.nickname,
    },
  });
});
