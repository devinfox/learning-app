import { db } from "@/lib/db";
import type { Chapter, Subject, Syllabus } from "@/lib/db/types";
import { listEnrollments, type EnrollmentView } from "./enrollment";
import {
  EMPTY_PROGRESS,
  nextChapter,
  summariseSyllabusProgress,
  type ProgressSummary,
} from "./progress";

export interface DashboardCard {
  subject: Subject;
  enrollmentId: string;
  syllabusId: string | null;
  syllabusStatus: Syllabus["status"] | null;
  placementStatus: EnrollmentView["placementStatus"];
  currentChapter: Pick<Chapter, "id" | "order" | "title" | "summary"> | null;
  currentLessonId: string | null;
  progress: ProgressSummary;
}

export interface Dashboard {
  greeting: "morning" | "afternoon" | "evening";
  name: string;
  subjects: Array<{ id: string; name: string; isNew: boolean }>;
  selected: DashboardCard | null;
  pendingPlacement: Array<{ subjectId: string; name: string }>;
}

function greetingFor(date: Date): Dashboard["greeting"] {
  const hour = date.getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

export async function getDashboard(params: {
  userId: string;
  name: string;
  subjectId?: string;
}): Promise<Dashboard> {
  const enrollments = await listEnrollments(params.userId);
  const ordered = [...enrollments].sort(
    (a, b) => Date.parse(a.addedAt) - Date.parse(b.addedAt),
  );

  const selectedEnrollment =
    ordered.find((row) => row.subject.id === params.subjectId) ?? ordered[0] ?? null;

  return {
    greeting: greetingFor(new Date()),
    name: params.name,
    subjects: ordered.map((row) => ({
      id: row.subject.id,
      name: row.subject.name,
      isNew: row.isNew,
    })),
    selected: selectedEnrollment ? await toCard(params.userId, selectedEnrollment) : null,
    pendingPlacement: ordered
      .filter((row) => row.placementStatus === "pending")
      .map((row) => ({ subjectId: row.subject.id, name: row.subject.name })),
  };
}

async function toCard(userId: string, enrollment: EnrollmentView): Promise<DashboardCard> {
  const syllabus = enrollment.syllabusId
    ? await db.syllabi.get(enrollment.syllabusId)
    : null;

  const chapter = syllabus ? await nextChapter(userId, syllabus) : null;

  return {
    subject: enrollment.subject,
    enrollmentId: enrollment.id,
    syllabusId: enrollment.syllabusId,
    syllabusStatus: syllabus?.status ?? null,
    placementStatus: enrollment.placementStatus,
    currentChapter: chapter
      ? {
          id: chapter.id,
          order: chapter.order,
          title: chapter.title,
          summary: chapter.summary,
        }
      : null,
    currentLessonId: chapter?.lessonId ?? null,
    progress: syllabus
      ? await summariseSyllabusProgress(userId, syllabus)
      : EMPTY_PROGRESS,
  };
}
