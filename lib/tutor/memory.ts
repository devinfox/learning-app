import { z } from "zod";
import { generateObject, isAiEnabled } from "@/lib/ai/client";
import { db, newId, now } from "@/lib/db";
import type { LearnerMemory, LearnerMemoryKind, MemoryHorizon } from "./types";
import {
  FOLLOW_UP_WINDOW_DAYS,
  LIFE_EXPIRES_AFTER_DAYS,
  MAX_FOLLOW_UPS_IN_PROMPT,
  MAX_MEMORIES_IN_PROMPT,
  MEMORY_CONFIDENCE_FLOOR,
  MEMORY_STALE_AFTER_DAYS,
  PLAN_EXPIRES_AFTER_DAYS,
  isMemoryWriteEnabled,
} from "./config";

const DAY_MS = 86_400_000;

const HORIZON: Record<LearnerMemoryKind, MemoryHorizon> = {
  analogy: "enduring",
  interest: "enduring",
  misconception: "enduring",
  strength: "enduring",
  struggle: "enduring",
  preference: "enduring",
  plan: "episodic",
  life: "episodic",
  circumstance: "enduring",
};

const EPISODIC_TTL_DAYS: Partial<Record<LearnerMemoryKind, number>> = {
  plan: PLAN_EXPIRES_AFTER_DAYS,
  life: LIFE_EXPIRES_AFTER_DAYS,
};

export function horizonFor(kind: LearnerMemoryKind): MemoryHorizon {
  return HORIZON[kind];
}

function isExpired(memory: LearnerMemory, at = Date.now()): boolean {
  return memory.expiresAt !== null && Date.parse(memory.expiresAt) <= at;
}

const extractionSchema = z.object({
  memories: z.array(
    z.object({
      kind: z.enum([
        "analogy",
        "interest",
        "misconception",
        "strength",
        "struggle",
        "preference",
        "plan",
        "life",
        "circumstance",
      ]),
      content: z.string(),
      concept: z.string().nullable(),
      confidence: z.number(),
      followUpInDays: z.number().nullable(),
    }),
  ),
});

export async function listMemories(
  userId: string,
  options: { includeExpired?: boolean } = {},
): Promise<LearnerMemory[]> {
  const rows = await db.learnerMemories.find(
    (row) => row.userId === userId && row.retiredAt === null,
  );
  return options.includeExpired ? rows : rows.filter((row) => !isExpired(row));
}

export async function memoriesForPrompt(params: {
  userId: string;
  subjectId?: string | null;
  concept?: string | null;
}): Promise<LearnerMemory[]> {
  const staleBefore = Date.now() - MEMORY_STALE_AFTER_DAYS * 86_400_000;

  const candidates = (await listMemories(params.userId)).filter((memory) => {
    if (memory.kind === "plan" && memory.followedUpAt !== null) return false;

    if (memory.sensitive) return true;

    return (
      memory.confidence >= MEMORY_CONFIDENCE_FLOOR &&
      Date.parse(memory.updatedAt) >= staleBefore
    );
  });

  const score = (memory: LearnerMemory): number => {
    let value = memory.confidence + Math.min(memory.reinforcedCount, 5) * 0.1;
    if (params.subjectId && memory.subjectId === params.subjectId) value += 0.5;
    if (params.concept && memory.concept && sameConcept(memory.concept, params.concept)) {
      value += 0.6;
    }
    if (memory.kind === "interest") value += 0.25;
    return value;
  };

  return candidates
    .sort((a, b) => score(b) - score(a))
    .slice(0, MAX_MEMORIES_IN_PROMPT);
}

function normalise(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
}

function sameConcept(a: string, b: string): boolean {
  return normalise(a) === normalise(b);
}

export async function recordMemory(params: {
  userId: string;
  kind: LearnerMemoryKind;
  content: string;
  concept?: string | null;
  subjectId?: string | null;
  confidence?: number;
  sourceChatId?: string | null;
  followUpInDays?: number | null;
}): Promise<LearnerMemory | null> {
  if (!isMemoryWriteEnabled()) return null;

  const existing = (await listMemories(params.userId)).find(
    (memory) =>
      memory.kind === params.kind && normalise(memory.content) === normalise(params.content),
  );

  if (existing) {
    return db.learnerMemories.mutate(existing.id, (row) => ({
      ...row,
      confidence: Math.min(0.98, row.confidence + (1 - row.confidence) * 0.35),
      reinforcedCount: row.reinforcedCount + 1,
      concept: row.concept ?? params.concept ?? null,
      subjectId: row.subjectId ?? params.subjectId ?? null,
      updatedAt: now(),
    }));
  }

  const horizon = horizonFor(params.kind);
  const ttlDays = EPISODIC_TTL_DAYS[params.kind];

  const followUpAt =
    params.followUpInDays != null
      ? new Date(Date.now() + Math.max(0, params.followUpInDays) * DAY_MS).toISOString()
      : null;

  const expiresFrom = followUpAt ? Date.parse(followUpAt) : Date.now();
  const expiresAt =
    horizon === "episodic" && ttlDays !== undefined
      ? new Date(expiresFrom + ttlDays * DAY_MS).toISOString()
      : null;

  const memory: LearnerMemory = {
    id: newId("mem"),
    userId: params.userId,
    kind: params.kind,
    content: params.content,
    concept: params.concept ?? null,
    subjectId: params.subjectId ?? null,
    confidence: params.confidence ?? 0.6,
    reinforcedCount: 0,
    sourceChatId: params.sourceChatId ?? null,
    horizon,
    expiresAt,
    followUpAt,
    followedUpAt: null,
    sensitive: params.kind === "circumstance",
    createdAt: now(),
    updatedAt: now(),
    retiredAt: null,
  };
  await db.learnerMemories.insert(memory);
  return memory;
}

export async function claimDueFollowUps(userId: string): Promise<LearnerMemory[]> {
  const at = Date.now();

  const due = (await listMemories(userId))
    .filter(
      (memory) =>
        memory.followUpAt !== null &&
        memory.followedUpAt === null &&
        Date.parse(memory.followUpAt) <= at &&
        at - Date.parse(memory.followUpAt) <= FOLLOW_UP_WINDOW_DAYS * DAY_MS,
    )
    .sort((a, b) => Date.parse(b.followUpAt!) - Date.parse(a.followUpAt!))
    .slice(0, MAX_FOLLOW_UPS_IN_PROMPT);

  for (const memory of due) {
    await db.learnerMemories.update(memory.id, {
      followedUpAt: now(),
      updatedAt: now(),
    });
  }

  return due;
}

export async function retireMemory(userId: string, memoryId: string): Promise<boolean> {
  const memory = await db.learnerMemories.get(memoryId);
  if (!memory || memory.userId !== userId) return false;
  await db.learnerMemories.update(memoryId, { retiredAt: now(), updatedAt: now() });
  return true;
}

export async function extractMemoriesFromExchange(params: {
  userId: string;
  subjectId?: string | null;
  chatId?: string | null;
  learnerMessage: string;
  tutorReply: string;
}): Promise<LearnerMemory[]> {
  if (!isMemoryWriteEnabled() || !isAiEnabled()) return [];

  let extracted: z.infer<typeof extractionSchema>;
  try {
    extracted = await generateObject({
      schema: extractionSchema,
      schemaName: "learner_memories",
      effort: "low",
      maxTokens: 1200,
      system: `You watch a tutoring exchange and note only what would genuinely help this learner's UVBrain teacher teach, support, or avoid blundering next time.

Record a memory only when the exchange gives real evidence. An exchange usually yields zero or one. Returning an empty list is the common, correct outcome.

- analogy: an analogy or framing the tutor used that the learner explicitly reacted to ("ohh", "that makes sense now", a correct restatement in their own words). Record the analogy AND the concept it explained.
- interest: something the learner brought up that they care about — a game, a sport, a hobby. These become future analogies.
- misconception: a specific wrong model the learner revealed. Record the wrong belief, not just the topic.
- strength: something they got immediately and correctly.
- struggle: a difficulty that looks recurring rather than a one-off slip, including a curriculum gap such as "does not yet understand place value".
- preference: how they said they like to be taught, including learning-support needs or accommodations they state, such as needing text read aloud or wanting one step at a time.

You also note what is going on in their life, because a tutor who remembers is a tutor they trust:

- plan: something specific coming up for them — a trip, a match, a birthday, a visit. Set followUpInDays to when it will have happened: 2 for "this weekend", 1 for "tomorrow", 7 for "next Saturday". This is what lets the tutor ask how it went.
- life: an ongoing detail with no date — a new puppy, a house move, a best friend's name, a club they joined.
- circumstance: something significant and lasting — a death in the family, a diagnosis or learning difficulty they mentioned, a parent ill, a big change at home. Record only the fact needed to avoid future blunders, carefully and factually, in their own terms: "Told me his grandad died in March." Never diagnose, never soften, never speculate about what it means, and do not record advice or emotional interpretation. Confidence 0.9 when they said it plainly.

Rules for all of these:
- Record only what they actually said. Never infer a family situation from a mood.
- Write it so it can be read back months later without misleading anyone.
- Never record a home address, a school name, a phone number, a username, a password, or anyone's full name.
- Do not record another child's full name. A first name is allowed only when the learner uses it and it matters for future rapport.
- If the candidate repeats a durable fact already likely to be known, return no memory unless this exchange adds a meaningful new detail.
- If they mention something distressing, still record it as circumstance — the tutor needs to know so it does not blunder into it later.

Do not record: the topic studied, that they asked a question, politeness, or anything you are inferring rather than observing. Confidence should be 0.5 for a single soft signal and 0.8 when the learner said it outright.`,
      prompt: `Learner said:
"""
${params.learnerMessage}
"""

Tutor replied:
"""
${params.tutorReply}
"""`,
    });
  } catch (error) {
    console.error("[tutor] memory extraction failed:", error);
    return [];
  }

  const saved: LearnerMemory[] = [];
  for (const candidate of extracted.memories) {
    const memory = await recordMemory({
      userId: params.userId,
      kind: candidate.kind,
      content: candidate.content,
      concept: candidate.concept,
      subjectId: params.subjectId ?? null,
      confidence: Math.max(0, Math.min(1, candidate.confidence)),
      sourceChatId: params.chatId ?? null,
      followUpInDays: candidate.followUpInDays,
    });
    if (memory) saved.push(memory);
  }
  return saved;
}

export function formatMemoriesForPrompt(memories: LearnerMemory[]): string {
  if (memories.length === 0) return "";

  const byKind = new Map<LearnerMemoryKind, LearnerMemory[]>();
  for (const memory of memories) {
    byKind.set(memory.kind, [...(byKind.get(memory.kind) ?? []), memory]);
  }

  const HEADINGS: Record<LearnerMemoryKind, string> = {
    analogy: "Explanations that have worked for this learner — reuse their shape",
    interest: "They care about these — good sources for new analogies",
    misconception: "Wrong models they have held — check whether they still do",
    strength: "They pick these up fast — don't over-explain",
    struggle: "Recurring difficulty — slow down here",
    preference: "How they like to be taught",
    circumstance:
      "IMPORTANT — what is going on in their life. Read this before anything else, and never contradict it",
    life: "Their life outside school",
    plan: "Coming up for them",
  };

  const order: LearnerMemoryKind[] = [
    "circumstance",
    "life",
    "plan",
    "analogy",
    "interest",
    "misconception",
    "struggle",
    "strength",
    "preference",
  ];

  const sections = order
    .filter((kind) => byKind.has(kind))
    .map((kind) => {
      const lines = (byKind.get(kind) ?? [])
        .map((memory) => `- ${memory.content}${memory.concept ? ` (${memory.concept})` : ""}`)
        .join("\n");
      return `${HEADINGS[kind]}:\n${lines}`;
    });

  return `## What you know about this learner\n\n${sections.join("\n\n")}`;
}
