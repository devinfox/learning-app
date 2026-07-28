import { requireVerified } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { handler, json } from "@/lib/http";
import { pointsLedger } from "@/lib/gamification";
import { examPlan } from "@/lib/services/exams";
import { TIER_ORDER, subjectMastery, type MasteryTier } from "@/lib/services/mastery";

const TIER_WEIGHT: Record<MasteryTier, number> = {
  dim: 0,
  lit: 1,
  bright: 2,
  radiant: 3,
  prism: 4,
};

export const GET = handler(async () => {
  const { user } = await requireVerified();

  const [subjects, enrollments, syllabi, points] = await Promise.all([
    db.subjects.all(),
    db.enrollments.find((row) => row.userId === user.id),
    db.syllabi.find((row) => row.userId === user.id),
    pointsLedger(user.id),
  ]);

  const pointsBySubject = new Map<string, number>();
  for (const entry of points.entries) {
    if (!entry.subjectId) continue;
    pointsBySubject.set(
      entry.subjectId,
      (pointsBySubject.get(entry.subjectId) ?? 0) + entry.points,
    );
  }

  const courses = [];

  for (const enrollment of enrollments) {
    const subject = subjects.find((row) => row.id === enrollment.subjectId);
    if (!subject) continue;

    const syllabus = syllabi.find((row) => row.subjectId === subject.id);
    if (!syllabus || syllabus.status !== "ready") {
      courses.push({
        subjectId: subject.id,
        slug: subject.slug,
        name: subject.name,
        icon: subject.icon,
        syllabusId: syllabus?.id ?? null,
        status: syllabus?.status ?? "pending",
        chapters: [],
        counts: null,
        charge: 0,
        points: pointsBySubject.get(subject.id) ?? 0,
        exams: [],
      });
      continue;
    }

    const mastery = await subjectMastery(user.id, syllabus);
    const exams = await examPlan(user.id, syllabus);
    const byId = new Map(syllabus.chapters.map((row) => [row.id, row]));

    const weight = mastery.chapters.reduce(
      (sum, row) => sum + TIER_WEIGHT[row.tier],
      0,
    );

    courses.push({
      subjectId: subject.id,
      slug: subject.slug,
      name: subject.name,
      icon: subject.icon,
      syllabusId: syllabus.id,
      status: syllabus.status,
      chapters: mastery.chapters.map((row) => ({
        id: row.chapterId,
        title: byId.get(row.chapterId)?.title ?? "Chapter",
        order: byId.get(row.chapterId)?.order ?? 0,
        tier: row.tier,
        percent: row.percent,
        completed: row.completed,
        unlocked: row.unlocked,
        nextTierAt: row.nextTierAt,
        current: row.chapterId === mastery.currentChapterId,
      })),
      counts: mastery.counts,
      charge:
        mastery.chapters.length > 0
          ? Math.round((weight / (mastery.chapters.length * 4)) * 100)
          : 0,
      points: pointsBySubject.get(subject.id) ?? 0,
      exams: exams.map((exam) => ({
        id: exam.id,
        kind: exam.kind,
        title: exam.title,
        unlocked: exam.unlocked,
        requirement: exam.requirement,
        best: exam.best,
      })),
    });
  }

  const allChapters = courses.flatMap((course) => course.chapters);
  const byTier = TIER_ORDER.reduce(
    (acc, tier) => ({
      ...acc,
      [tier]: allChapters.filter((row) => row.tier === tier).length,
    }),
    {} as Record<MasteryTier, number>,
  );

  return json({
    courses,
    totals: {
      chapters: allChapters.length,
      lit: allChapters.filter((row) => row.tier !== "dim").length,
      byTier,
    },
    points: {
      total: points.total,
      thisWeek: points.thisWeek,
      bestWeek: points.bestWeek,
      weekResetsAt: points.weekResetsAt,
    },
  });
});
