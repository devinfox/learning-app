import { requireVerified } from "@/lib/auth/session";
import { handler, json } from "@/lib/http";
import { listProjects } from "@/lib/services/projects";

export const GET = handler(async () => {
  const { user } = await requireVerified();
  const entries = await listProjects(user.id);

  return json({
    projects: entries.map((entry) => ({
      id: entry.project.id,
      title: entry.project.title,
      blurb: entry.project.blurb,
      subjectId: entry.project.subjectId,
      subjectName: entry.subjectName,
      criteria: entry.project.rubric.length,
      maxScore: entry.project.rubric.reduce((sum, row) => sum + row.points, 0),
      unlocked: entry.unlocked,
      requirement: entry.requirement,
      chaptersDone: entry.chaptersDone,
      chaptersRequired: entry.project.chaptersRequired,
      submission: entry.submission
        ? {
            id: entry.submission.id,
            status: entry.submission.status,
            score: entry.submission.score,
            maxScore: entry.submission.maxScore,
            submittedAt: entry.submission.submittedAt,
            gradedAt: entry.submission.gradedAt,
          }
        : null,
    })),
  });
});
