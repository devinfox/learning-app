import { houseFor, HOUSES } from "@/lib/gamification/houses";
import { POINTS_PER_QUESTION } from "@/lib/services/courses";
import { db, newId } from "./index";
import { daysAgo } from "./seed-support";
import type { Attempt, Profile, Progress, User } from "./types";

const NAMES = [
  "Amara",
  "Bo",
  "Priya",
  "Theo",
  "Marisol",
  "Ish",
  "Nadia",
  "Rafi",
  "Junie",
  "Otto",
  "Zeynep",
  "Caleb",
];

const PER_HOUSE = 3;

function random(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1_664_525 + 1_013_904_223) >>> 0;
    return state / 4_294_967_296;
  };
}

function balancedIds(): string[] {
  const room = new Map(HOUSES.map((house) => [house.id, PER_HOUSE]));
  const ids: string[] = [];

  for (const [index, name] of NAMES.entries()) {
    for (let salt = 0; salt < 500; salt += 1) {
      const candidate = `usr_mate_${index}_${salt}`;
      const house = houseFor(candidate).id;
      if ((room.get(house) ?? 0) <= 0) continue;
      room.set(house, (room.get(house) ?? 0) - 1);
      ids.push(candidate);
      break;
    }
    if (ids.length <= index) ids.push(`usr_mate_${index}_x`);
    void name;
  }

  return ids;
}

export interface ClassmateSummary {
  learners: number;
  attempts: number;
  byHouse: Record<string, number>;
}

export async function seedClassmates(): Promise<ClassmateSummary> {
  const subjects = await db.subjects.all();
  if (subjects.length === 0) {
    return { learners: 0, attempts: 0, byHouse: {} };
  }

  const ids = balancedIds();

  for (const id of ids) {
    await db.attempts.removeWhere((row) => row.userId === id);
    await db.progress.removeWhere((row) => row.userId === id);
    await db.profiles.removeWhere((row) => row.userId === id);
    await db.users.remove(id);
  }

  const attempts: Attempt[] = [];
  const progress: Progress[] = [];
  const byHouse: Record<string, number> = {};

  for (const [index, userId] of ids.entries()) {
    const name = NAMES[index];
    const roll = random(index * 7919 + 13);
    const house = houseFor(userId).id;
    byHouse[house] = (byHouse[house] ?? 0) + 1;

    const user: User = {
      id: userId,
      email: `${name.toLowerCase()}@classmate.local`,
      passwordHash: null,
      provider: "password",
      emailVerified: true,
      createdAt: daysAgo(40),
      updatedAt: daysAgo(40),
    };

    const profile: Profile & { id: string } = {
      id: newId("prf"),
      userId,
      name,
      pronouns: null,
      birthYear: 2016,
      avatarUrl: null,
      locale: "en",
      theme: "system",
      onboardedAt: daysAgo(40),
    };

    await db.users.insert(user);
    await db.profiles.insert(profile);

    const pace = 0.35 + roll() * 0.65;
    const sessions = Math.round(6 + roll() * 14);

    for (let session = 0; session < sessions; session += 1) {
      const when = daysAgo(Math.floor(roll() * 20));
      const subject = subjects[Math.floor(roll() * subjects.length)];
      const questions = 5;
      const correct = Math.max(
        1,
        Math.min(questions, Math.round(questions * (0.45 + roll() * pace))),
      );
      const exam = roll() > 0.86;

      attempts.push({
        id: newId("att"),
        userId,
        quizId: `qz_mate_${userId}_${session}`,
        kind: exam ? "exam" : "lesson",
        subjectId: subject.id,
        startedAt: when,
        submittedAt: when,
        answers: {},
        correctCount: correct,
        totalQuestions: questions,
        score: correct * POINTS_PER_QUESTION,
        maxScore: questions * POINTS_PER_QUESTION,
        durationSeconds: 240 + Math.floor(roll() * 400),
        passed: correct / questions >= 0.6,
      });

      if (roll() > 0.4) {
        progress.push({
          id: newId("prg"),
          userId,
          syllabusId: `syl_mate_${userId}`,
          chapterId: `ch_mate_${userId}_${session}`,
          lessonId: `les_mate_${userId}_${session}`,
          slideIndex: 0,
          slideCount: 4,
          attemptedInteractiveIds: [],
          completed: true,
          completedAt: when,
          updatedAt: when,
        });
      }
    }
  }

  await db.attempts.insertMany(attempts);
  await db.progress.insertMany(progress);

  return { learners: ids.length, attempts: attempts.length, byHouse };
}
