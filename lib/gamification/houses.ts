import { db } from "@/lib/db";
import { allLearnerPoints, levelFor } from "./points";

export interface House {
  id: string;
  name: string;
  motto: string;
  tint: string;
}

export const HOUSES: House[] = [
  {
    id: "nova",
    name: "Nova",
    motto: "First to try the hard one",
    tint: "var(--color-ray-1)",
  },
  {
    id: "tide",
    name: "Tide",
    motto: "Comes back and back again",
    tint: "var(--color-ray-2)",
  },
  {
    id: "grove",
    name: "Grove",
    motto: "Nothing here grew overnight",
    tint: "var(--color-ray-3)",
  },
  {
    id: "solis",
    name: "Solis",
    motto: "Turns work into light",
    tint: "var(--color-ray-4)",
  },
];

export function houseFor(userId: string): House {
  let hash = 0;
  for (let index = 0; index < userId.length; index += 1) {
    hash = (hash * 31 + userId.charCodeAt(index)) >>> 0;
  }
  return HOUSES[hash % HOUSES.length];
}

export interface HouseStanding {
  house: House;
  points: number;
  members: number;
  share: number;
}

export interface LearnerStanding {
  userId: string;
  name: string;
  houseId: string;
  thisWeek: number;
  lastWeek: number;
  total: number;
  level: number;
  rank: number;
  lastRank: number;
  movement: number;
  isYou: boolean;
}

export interface Standings {
  houses: HouseStanding[];
  learners: LearnerStanding[];
  yourHouse: House;
  yourRank: number | null;
  learnerCount: number;
}

export async function standings(userId: string): Promise<Standings> {
  const [points, profiles] = await Promise.all([allLearnerPoints(), db.profiles.all()]);

  const nameById = new Map(profiles.map((row) => [row.userId, row.name]));

  const lastRanks = new Map(
    [...points]
      .sort((a, b) => b.lastWeek - a.lastWeek || b.total - a.total)
      .map((row, index) => [row.userId, index + 1]),
  );

  const learners = points
    .map((row) => ({
      userId: row.userId,
      name: nameById.get(row.userId) ?? "A learner",
      houseId: houseFor(row.userId).id,
      thisWeek: row.thisWeek,
      lastWeek: row.lastWeek,
      total: row.total,
      level: levelFor(row.total).level,
      rank: 0,
      lastRank: lastRanks.get(row.userId) ?? 0,
      movement: 0,
      isYou: row.userId === userId,
    }))
    .sort((a, b) => b.thisWeek - a.thisWeek || b.total - a.total)
    .map((row, index) => ({
      ...row,
      rank: index + 1,
      movement: row.lastRank > 0 ? row.lastRank - (index + 1) : 0,
    }));

  const houseTotals = HOUSES.map((house) => {
    const members = learners.filter((row) => row.houseId === house.id);
    return {
      house,
      points: members.reduce((sum, row) => sum + row.thisWeek, 0),
      members: members.length,
      share: 0,
    };
  });

  const highest = Math.max(1, ...houseTotals.map((row) => row.points));

  return {
    houses: houseTotals
      .map((row) => ({ ...row, share: row.points / highest }))
      .sort((a, b) => b.points - a.points),
    learners,
    yourHouse: houseFor(userId),
    yourRank: learners.find((row) => row.isYou)?.rank ?? null,
    learnerCount: learners.length,
  };
}
