import { requireVerified } from "@/lib/auth/session";
import { handler, json } from "@/lib/http";
import { HOUSES, levelFor, pointsLedger, standings } from "@/lib/gamification";

const NEIGHBOURS = 9;

export const GET = handler(async () => {
  const { user } = await requireVerified();

  const [points, board] = await Promise.all([pointsLedger(user.id), standings(user.id)]);

  const yourIndex = board.learners.findIndex((row) => row.isYou);
  const start = Math.max(0, yourIndex - NEIGHBOURS);
  const division = board.learners.slice(start, start + NEIGHBOURS * 2 + 1);
  const you = board.learners.find((row) => row.isYou);

  const streak = (() => {
    const weeks = [...points.weeks].sort(
      (a, b) => Date.parse(b.startsAt) - Date.parse(a.startsAt),
    );
    let run = 0;
    for (const week of weeks) {
      if (week.points <= 0) break;
      run += 1;
    }
    return run;
  })();

  const topHouse = board.houses[0];

  return json({
    you: {
      houseId: board.yourHouse.id,
      rank: board.yourRank,
      movement: you?.movement ?? 0,
      thisWeek: points.thisWeek,
      lastWeek: points.lastWeek,
      bestWeek: points.bestWeek,
      total: points.total,
      activeWeeks: streak,
      level: levelFor(points.total),
      beatingBest: points.thisWeek >= points.bestWeek && points.thisWeek > 0,
      weekResetsAt: points.weekResetsAt,
      weekStartsAt: points.weekStartsAt,
      toNextRank:
        you && you.rank > 1
          ? Math.max(
              0,
              (board.learners[you.rank - 2]?.thisWeek ?? you.thisWeek) - you.thisWeek + 1,
            )
          : 0,
    },
    houses: board.houses.map((row) => ({
      id: row.house.id,
      name: row.house.name,
      motto: row.house.motto,
      tint: row.house.tint,
      points: row.points,
      members: row.members,
      share: row.share,
      leading: row.house.id === topHouse?.house.id && row.points > 0,
      behindLeader: Math.max(0, (topHouse?.points ?? 0) - row.points),
      roster: board.learners
        .filter((learner) => learner.houseId === row.house.id)
        .sort((a, b) => b.thisWeek - a.thisWeek)
        .map((learner) => ({
          name: learner.isYou ? "You" : learner.name,
          thisWeek: learner.thisWeek,
          isYou: learner.isYou,
        })),
    })),
    division: division.map((row) => ({
      rank: row.rank,
      name: row.isYou ? "You" : row.name,
      houseId: row.houseId,
      houseName: HOUSES.find((house) => house.id === row.houseId)?.name ?? "",
      tint: HOUSES.find((house) => house.id === row.houseId)?.tint ?? "",
      thisWeek: row.thisWeek,
      level: row.level,
      movement: row.movement,
      isYou: row.isYou,
    })),
    leaderWeek: Math.max(1, ...board.learners.map((row) => row.thisWeek)),
    learnerCount: board.learnerCount,
    breakdown: points.bySource,
    weeks: points.weeks.slice(-8),
    recent: points.entries.slice(0, 12),
  });
});
