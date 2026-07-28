import { db, newId, now } from "@/lib/db";
import type { Enrollment, Level, Subject, Syllabus } from "@/lib/db/types";
import { ApiError } from "@/lib/http";
import { getSubject } from "./catalog";
import { createSyllabusForEnrollment } from "./courses";
import { summariseSyllabusProgress, type ProgressSummary } from "./progress";

export interface EnrollmentView {
  id: string;
  subject: Subject;
  addedAt: string;
  placementStatus: Enrollment["placementStatus"];
  placementScore: number | null;
  level: Level | null;
  syllabusId: string | null;
  syllabusStatus: Syllabus["status"] | null;
  isNew: boolean;
  progress: ProgressSummary;
}

export async function listEnrollments(userId: string): Promise<EnrollmentView[]> {
  const enrollments = await db.enrollments.find((row) => row.userId === userId);
  return Promise.all(enrollments.map((enrollment) => toView(enrollment)));
}

export async function getEnrollment(
  userId: string,
  subjectId: string,
): Promise<Enrollment> {
  const enrollment = await db.enrollments.findOne(
    (row) => row.userId === userId && row.subjectId === subjectId,
  );
  if (!enrollment) throw ApiError.notFound("You haven't added that subject yet.");
  return enrollment;
}

export async function addSubject(userId: string, subjectId: string): Promise<EnrollmentView> {
  await getSubject(subjectId);

  const existing = await db.enrollments.findOne(
    (row) => row.userId === userId && row.subjectId === subjectId,
  );
  if (existing) throw ApiError.conflict("That subject is already in your list.");

  const enrollment: Enrollment = {
    id: newId("enr"),
    userId,
    subjectId,
    addedAt: now(),
    placementStatus: "pending",
    placementScore: null,
    level: null,
    syllabusId: null,
  };
  await db.enrollments.insert(enrollment);
  return toView(enrollment);
}

export async function removeSubject(userId: string, subjectId: string): Promise<void> {
  const enrollment = await getEnrollment(userId, subjectId);

  if (enrollment.syllabusId) {
    const lessons = await db.lessons.find(
      (lesson) => lesson.syllabusId === enrollment.syllabusId,
    );
    const lessonIds = new Set(lessons.map((lesson) => lesson.id));
    await db.progress.removeWhere((row) => lessonIds.has(row.lessonId));
    await db.lessons.removeWhere((lesson) => lessonIds.has(lesson.id));
    await db.syllabi.remove(enrollment.syllabusId);
  }

  await db.quizzes.removeWhere(
    (quiz) => quiz.userId === userId && quiz.subjectId === subjectId,
  );
  await db.attempts.removeWhere(
    (attempt) => attempt.userId === userId && attempt.subjectId === subjectId,
  );
  await db.enrollments.remove(enrollment.id);
}

export async function completePlacement(params: {
  userId: string;
  subjectId: string;
  score: number;
  level: Level;
}): Promise<EnrollmentView> {
  const enrollment = await getEnrollment(params.userId, params.subjectId);

  const syllabus =
    enrollment.syllabusId ??
    (
      await createSyllabusForEnrollment({
        userId: params.userId,
        subjectId: params.subjectId,
        level: params.level,
      })
    ).id;

  const updated = await db.enrollments.update(enrollment.id, {
    placementStatus: "completed",
    placementScore: params.score,
    level: params.level,
    syllabusId: syllabus,
  });

  return toView(updated ?? enrollment);
}

export async function skipPlacement(params: {
  userId: string;
  subjectId: string;
}): Promise<EnrollmentView> {
  const enrollment = await getEnrollment(params.userId, params.subjectId);
  if (enrollment.placementStatus === "completed") return toView(enrollment);

  const syllabus =
    enrollment.syllabusId ??
    (
      await createSyllabusForEnrollment({
        userId: params.userId,
        subjectId: params.subjectId,
        level: "beginner",
      })
    ).id;

  const updated = await db.enrollments.update(enrollment.id, {
    placementStatus: "skipped",
    level: "beginner",
    syllabusId: syllabus,
  });

  return toView(updated ?? enrollment);
}

async function toView(enrollment: Enrollment): Promise<EnrollmentView> {
  const subject = await getSubject(enrollment.subjectId);
  const syllabus = enrollment.syllabusId
    ? await db.syllabi.get(enrollment.syllabusId)
    : null;

  return {
    id: enrollment.id,
    subject,
    addedAt: enrollment.addedAt,
    placementStatus: enrollment.placementStatus,
    placementScore: enrollment.placementScore,
    level: enrollment.level,
    syllabusId: enrollment.syllabusId,
    syllabusStatus: syllabus?.status ?? null,
    isNew: enrollment.placementStatus === "pending",
    progress: await summariseSyllabusProgress(enrollment.userId, syllabus),
  };
}
