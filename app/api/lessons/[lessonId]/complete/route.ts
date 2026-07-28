import { requireVerified } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { handler, json } from "@/lib/http";
import { getLesson, getSyllabus } from "@/lib/services/courses";
import { completeLesson, summariseSyllabusProgress } from "@/lib/services/progress";
import { earnedIds, rewardLedger } from "@/lib/gamification";

export const POST = handler(
  async (_request: Request, ctx: RouteContext<"/api/lessons/[lessonId]/complete">) => {
    const { user } = await requireVerified();
    const { lessonId } = await ctx.params;

    const before = earnedIds(await rewardLedger(user.id));
    await completeLesson({ userId: user.id, lessonId });
    const after = await rewardLedger(user.id);
    const unlocked = after.earned.filter((row) => !before.has(row.reward.id));

    const lesson = await getLesson(user.id, lessonId);
    const syllabus = await getSyllabus(user.id, lesson.syllabusId);

    const ordered = [...syllabus.chapters].sort((a, b) => a.order - b.order);
    const index = ordered.findIndex((chapter) => chapter.id === lesson.chapterId);
    const nextChapter = index >= 0 ? (ordered[index + 1] ?? null) : null;

    return json({
      completed: true,
      quizId: lesson.quizId,
      unlocked: unlocked.map((row) => ({
        id: row.reward.id,
        name: row.reward.name,
        blurb: row.reward.blurb,
        reason: row.reason,
        earnedAt: row.earnedAt,
      })),
      nextChapter: nextChapter
        ? { id: nextChapter.id, order: nextChapter.order, title: nextChapter.title }
        : null,
      progress: await summariseSyllabusProgress(user.id, await db.syllabi.get(syllabus.id)),
    });
  },
);
