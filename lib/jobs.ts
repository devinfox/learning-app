import { db, newId, now } from "@/lib/db";
import type { Job, JobType } from "@/lib/db/types";

type JobHandler = (payload: Record<string, string>) => Promise<void>;

const handlers = new Map<JobType, JobHandler>();

export function registerJobHandler(type: JobType, handler: JobHandler): void {
  handlers.set(type, handler);
}

const STUCK_AFTER_MS = 5 * 60_000;

export async function enqueue(
  type: JobType,
  payload: Record<string, string>,
): Promise<Job> {
  const job: Job = {
    id: newId("job"),
    type,
    status: "queued",
    payload,
    error: null,
    createdAt: now(),
    startedAt: null,
    finishedAt: null,
  };
  await db.jobs.insert(job);

  void run(job);

  return job;
}

async function run(job: Job): Promise<void> {
  const handler = handlers.get(job.type);
  if (!handler) {
    await db.jobs.update(job.id, {
      status: "failed",
      error: `No handler registered for ${job.type}`,
      finishedAt: now(),
    });
    return;
  }

  await db.jobs.update(job.id, { status: "running", startedAt: now() });

  try {
    await handler(job.payload);
    await db.jobs.update(job.id, { status: "succeeded", finishedAt: now() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[jobs] ${job.type} failed:`, error);
    await db.jobs.update(job.id, {
      status: "failed",
      error: message,
      finishedAt: now(),
    });
  }
}

export async function recoverAbandonedWork(): Promise<void> {
  const cutoff = Date.now() - STUCK_AFTER_MS;
  const reason = "Generation did not complete — the server restarted.";

  const stuck = await db.jobs.find(
    (job) =>
      (job.status === "running" || job.status === "queued") &&
      new Date(job.startedAt ?? job.createdAt).getTime() < cutoff,
  );

  for (const job of stuck) {
    await db.jobs.update(job.id, { status: "failed", error: reason, finishedAt: now() });
  }

  const staleSyllabi = await db.syllabi.find(
    (syllabus) =>
      syllabus.status === "generating" &&
      Date.parse(syllabus.updatedAt) < cutoff,
  );
  for (const syllabus of staleSyllabi) {
    await db.syllabi.update(syllabus.id, {
      status: "failed",
      error: reason,
      updatedAt: now(),
    });
  }

  const staleQuizzes = await db.quizzes.find(
    (quiz) => quiz.status === "generating" && Date.parse(quiz.createdAt) < cutoff,
  );
  for (const quiz of staleQuizzes) {
    await db.quizzes.update(quiz.id, { status: "failed", error: reason });
  }

  const staleLessons = await db.lessons.find(
    (lesson) => lesson.status === "generating" && Date.parse(lesson.updatedAt) < cutoff,
  );
  for (const lesson of staleLessons) {
    await db.lessons.update(lesson.id, {
      status: "failed",
      error: reason,
      updatedAt: now(),
    });
    await db.syllabi.mutate(lesson.syllabusId, (row) => ({
      ...row,
      chapters: row.chapters.map((chapter) =>
        chapter.id === lesson.chapterId
          ? { ...chapter, lessonStatus: "failed" as const }
          : chapter,
      ),
    }));
  }
}
