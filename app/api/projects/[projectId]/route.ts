import { requireVerified } from "@/lib/auth/session";
import { handler, json } from "@/lib/http";
import { TEACHER_OVERRIDE, getProjectEntry } from "@/lib/services/projects";

export const GET = handler(
  async (_request: Request, ctx: RouteContext<"/api/projects/[projectId]">) => {
    const { user } = await requireVerified();
    const { projectId } = await ctx.params;

    const entry = await getProjectEntry(user.id, projectId);
    const { project, submission } = entry;

    return json({
      project: {
        id: project.id,
        title: project.title,
        blurb: project.blurb,
        prompt: project.prompt,
        steps: project.steps,
        rubric: project.rubric,
        maxScore: project.rubric.reduce((sum, row) => sum + row.points, 0),
        subjectId: project.subjectId,
        subjectName: entry.subjectName,
        chaptersRequired: project.chaptersRequired,
      },
      unlocked: entry.unlocked,
      requirement: entry.requirement,
      chaptersDone: entry.chaptersDone,
      teacherOverride: TEACHER_OVERRIDE,
      submission: submission
        ? {
            id: submission.id,
            body: submission.body,
            claimed: submission.claimed,
            status: submission.status,
            scores: submission.scores,
            score: submission.score,
            maxScore: submission.maxScore,
            feedback: submission.feedback,
            gradedAt: submission.gradedAt,
            gradedBy: submission.gradedBy,
            error: submission.error,
            submittedAt: submission.submittedAt,
          }
        : null,
    });
  },
);
