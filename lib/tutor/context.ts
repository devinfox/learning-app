import { db } from "@/lib/db";
import type { Profile, Syllabus } from "@/lib/db/types";
import { rewardLedger } from "@/lib/gamification";
import { subjectMastery, weekStats } from "@/lib/services/mastery";
import { bandForBirthYear } from "./bands";
import { getBrief } from "./course-brief";
import { claimDueFollowUps, memoriesForPrompt } from "./memory";
import type {
  CourseStanding,
  GradeBand,
  LearnerRecord,
  TutorContext,
  TutorSurface,
} from "./types";

export interface ActivationRequest {
  surface: TutorSurface;
  band?: GradeBand;
  subjectId?: string | null;
  lessonId?: string | null;
  slideIndex?: number | null;
  question?: { prompt: string; options: string[] } | null;
  exchangeCount?: number;
}

const TITLE_WINDOW = 3;

async function courseStanding(
  userId: string,
  subjectId: string,
): Promise<CourseStanding | null> {
  const enrollment = await db.enrollments.findOne(
    (row) => row.userId === userId && row.subjectId === subjectId,
  );
  if (!enrollment?.syllabusId) return null;

  const syllabus = (await db.syllabi.get(enrollment.syllabusId)) as Syllabus | null;
  if (!syllabus) return null;

  const subject = await db.subjects.get(subjectId);

  const chapters = [...syllabus.chapters].sort((a, b) => a.order - b.order);
  const mastery = await subjectMastery(userId, syllabus);
  const byId = new Map(mastery.chapters.map((chapter) => [chapter.chapterId, chapter]));

  const completed = chapters.filter((chapter) => byId.get(chapter.id)?.completed);
  const currentIndex = mastery.currentChapterId
    ? chapters.findIndex((chapter) => chapter.id === mastery.currentChapterId)
    : -1;

  const masteryCounts: Record<string, number> = {};
  for (const [tier, count] of Object.entries(mastery.counts)) {
    if (count > 0 && tier !== "dim") masteryCounts[tier] = count;
  }

  return {
    subjectId,
    subjectName: subject?.name ?? syllabus.title,
    courseTitle: syllabus.title,
    level: enrollment.level ?? null,
    placementTaken: enrollment.placementStatus !== "pending",
    totalChapters: chapters.length,
    completedChapters: completed.length,
    percentComplete:
      chapters.length > 0 ? Math.round((completed.length / chapters.length) * 100) : 0,
    currentChapterTitle: currentIndex >= 0 ? chapters[currentIndex].title : null,
    recentlyCompleted: completed.slice(-TITLE_WINDOW).reverse().map((c) => c.title),
    upNext:
      currentIndex >= 0
        ? chapters.slice(currentIndex + 1, currentIndex + 1 + TITLE_WINDOW).map((c) => c.title)
        : [],
    masteryCounts,
    chapters: chapters.map((chapter) => ({
      title: chapter.title,
      completed: Boolean(byId.get(chapter.id)?.completed),
    })),
  };
}

async function learnerRecord(
  userId: string,
  focusSubjectId: string | null,
): Promise<LearnerRecord> {
  const enrollments = await db.enrollments.find(
    (row) => row.userId === userId && row.syllabusId !== null,
  );

  const standings = (
    await Promise.all(
      enrollments.map((row) => courseStanding(userId, row.subjectId)),
    )
  ).filter((row): row is CourseStanding => row !== null);

  standings.sort((a, b) => {
    if (a.subjectId === focusSubjectId) return -1;
    if (b.subjectId === focusSubjectId) return 1;
    return b.percentComplete - a.percentComplete;
  });

  const [week, ledger] = await Promise.all([weekStats(userId), rewardLedger(userId)]);

  return {
    courses: standings,
    totalChaptersCompleted: standings.reduce((sum, row) => sum + row.completedChapters, 0),
    sessionsThisWeek: week.sessionsThisWeek,
    bestWeekSessions: week.bestWeekSessions,
    rewards: ledger.earned
      .slice(0, 8)
      .map((row) => ({ name: row.reward.name, reason: row.reason })),
  };
}

export async function assembleTutorContext(params: {
  profile: Profile;
  request: ActivationRequest;
}): Promise<TutorContext> {
  const { profile, request } = params;

  const band = request.band ?? bandForBirthYear(profile.birthYear);

  const lesson = request.lessonId ? await db.lessons.get(request.lessonId) : null;
  const subjectId = request.subjectId ?? lesson?.subjectId ?? null;
  const subject = subjectId ? await db.subjects.get(subjectId) : null;

  const slides = lesson ? [...lesson.slides].sort((a, b) => a.order - b.order) : [];
  const focused =
    request.slideIndex != null && slides[request.slideIndex]
      ? [slides[request.slideIndex]]
      : slides;

  const readingExcerpt =
    focused.length === 1 &&
    (request.surface === "reading" || request.surface === "lesson")
      ? [
          focused[0].heading,
          ...focused[0].body,
          ...(focused[0].reading?.body ?? []),
        ]
          .filter(Boolean)
          .join("\n\n")
      : null;

  const brief = subjectId
    ? await getBrief(subjectId, lesson?.syllabusId ?? null)
    : null;

  const memories = await memoriesForPrompt({
    userId: profile.userId,
    subjectId,
    concept: focused.length === 1 ? focused[0].heading : null,
  });

  const dueFollowUps =
    request.exchangeCount === 1 ? await claimDueFollowUps(profile.userId) : [];

  const record = await learnerRecord(profile.userId, subjectId);
  const standing =
    record.courses.find((course) => course.subjectId === subjectId) ?? null;

  return {
    band,
    surface: request.surface,
    learnerName: profile.name,
    subjectName: subject?.name ?? null,
    lessonTitle: lesson?.title ?? null,
    visibleHeadings: focused.map((slide) => slide.heading),
    readingExcerpt,
    activeQuestion: request.question ?? null,
    brief: brief ?? null,
    memories,
    standing,
    record,
    exchangeCount: request.exchangeCount ?? 0,
    dueFollowUps,
  };
}
