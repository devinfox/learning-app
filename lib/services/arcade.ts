import { db, newId, now } from "@/lib/db";
import type { ArcadePlay } from "@/lib/db/types";

export interface ArcadeGameStats {
  gameId: string;
  plays: number;
  questionsAnswered: number;
  questionsCorrect: number;
  perfectAnswers: number;
  bestRooms: number;
  lastPlayedAt: string | null;
}

export interface RecordPlayInput {
  userId: string;
  gameId: string;
  missionId: string;
  roomsCleared: number;
  questionsAnswered: number;
  questionsCorrect: number;
  perfectAnswers: number;
  heartsLeft: number;
}

export async function recordPlay(input: RecordPlayInput): Promise<ArcadePlay> {
  const play: ArcadePlay = {
    id: newId("play"),
    userId: input.userId,
    gameId: input.gameId,
    missionId: input.missionId,
    roomsCleared: input.roomsCleared,
    questionsAnswered: input.questionsAnswered,
    questionsCorrect: Math.min(input.questionsCorrect, input.questionsAnswered),
    perfectAnswers: Math.min(input.perfectAnswers, input.questionsAnswered),
    heartsLeft: input.heartsLeft,
    playedAt: now(),
  };

  await db.arcadePlays.insert(play);
  return play;
}

function emptyStats(gameId: string): ArcadeGameStats {
  return {
    gameId,
    plays: 0,
    questionsAnswered: 0,
    questionsCorrect: 0,
    perfectAnswers: 0,
    bestRooms: 0,
    lastPlayedAt: null,
  };
}

export async function statsForGame(
  userId: string,
  gameId: string,
): Promise<ArcadeGameStats> {
  const plays = await db.arcadePlays.find(
    (row) => row.userId === userId && row.gameId === gameId,
  );

  return plays.reduce<ArcadeGameStats>((totals, play) => {
    return {
      gameId,
      plays: totals.plays + 1,
      questionsAnswered: totals.questionsAnswered + play.questionsAnswered,
      questionsCorrect: totals.questionsCorrect + play.questionsCorrect,
      perfectAnswers: totals.perfectAnswers + play.perfectAnswers,
      bestRooms: Math.max(totals.bestRooms, play.roomsCleared),
      lastPlayedAt:
        totals.lastPlayedAt === null || play.playedAt > totals.lastPlayedAt
          ? play.playedAt
          : totals.lastPlayedAt,
    };
  }, emptyStats(gameId));
}
