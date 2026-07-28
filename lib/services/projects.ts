import { z } from "zod";
import { generateObject, isAiEnabled } from "@/lib/ai/client";
import { db, newId, now } from "@/lib/db";
import type { CriterionScore, Project, ProjectSubmission } from "@/lib/db/types";
import { ApiError } from "@/lib/http";
import { enqueue, registerJobHandler } from "@/lib/jobs";
import { templatesFor, type ProjectTemplate } from "@/lib/projects/catalog";

export const TEACHER_OVERRIDE = false;

const MIN_BODY = 200;

export interface ProjectEntry {
  project: Project;
  subjectName: string;
  unlocked: boolean;
  requirement: string;
  chaptersDone: number;
  submission: ProjectSubmission | null;
}

function projectId(userId: string, subjectId: string, slug: string): string {
  return `prj_${userId}_${subjectId}_${slug}`.replace(/[^a-zA-Z0-9_]/g, "");
}

function buildProject(params: {
  userId: string;
  subjectId: string;
  syllabusId: string | null;
  template: ProjectTemplate;
}): Project {
  const { userId, subjectId, syllabusId, template } = params;

  return {
    id: projectId(userId, subjectId, template.slug),
    slug: template.slug,
    userId,
    subjectId,
    syllabusId,
    title: template.title,
    blurb: template.blurb,
    prompt: template.prompt,
    steps: template.steps,
    rubric: template.rubric,
    chaptersRequired: template.chaptersRequired,
    createdAt: now(),
  };
}

export async function ensureProjects(userId: string): Promise<Project[]> {
  const [subjects, enrollments, syllabi, existing] = await Promise.all([
    db.subjects.all(),
    db.enrollments.find((row) => row.userId === userId),
    db.syllabi.find((row) => row.userId === userId),
    db.projects.find((row) => row.userId === userId),
  ]);

  const known = new Set(existing.map((row) => row.id));
  const created: Project[] = [];

  for (const enrollment of enrollments) {
    const subject = subjects.find((row) => row.id === enrollment.subjectId);
    if (!subject) continue;

    const syllabus = syllabi.find((row) => row.subjectId === subject.id) ?? null;

    for (const template of templatesFor(subject.slug)) {
      const project = buildProject({
        userId,
        subjectId: subject.id,
        syllabusId: syllabus?.id ?? null,
        template,
      });
      if (known.has(project.id)) continue;
      await db.projects.insert(project);
      created.push(project);
    }
  }

  return [...existing, ...created];
}

export async function listProjects(userId: string): Promise<ProjectEntry[]> {
  const projects = await ensureProjects(userId);

  const [subjects, syllabi, progress, submissions] = await Promise.all([
    db.subjects.all(),
    db.syllabi.find((row) => row.userId === userId),
    db.progress.find((row) => row.userId === userId && row.completed),
    db.submissions.find((row) => row.userId === userId),
  ]);

  const subjectById = new Map(subjects.map((row) => [row.id, row]));

  return projects
    .map((project) => {
      const syllabus = syllabi.find((row) => row.id === project.syllabusId);
      const chapterIds = new Set((syllabus?.chapters ?? []).map((row) => row.id));
      const chaptersDone = progress.filter((row) => chapterIds.has(row.chapterId)).length;
      const outstanding = Math.max(0, project.chaptersRequired - chaptersDone);

      const latest = submissions
        .filter((row) => row.projectId === project.id)
        .sort((a, b) => Date.parse(b.submittedAt) - Date.parse(a.submittedAt))[0];

      return {
        project,
        subjectName: subjectById.get(project.subjectId)?.name ?? "Your course",
        unlocked: outstanding === 0,
        requirement:
          outstanding === 0
            ? "Open"
            : outstanding === 1
              ? "Finish one more chapter"
              : `Finish ${outstanding} more chapters`,
        chaptersDone,
        submission: latest ?? null,
      };
    })
    .sort((a, b) => {
      if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
      return a.project.title.localeCompare(b.project.title);
    });
}

export async function getProjectEntry(
  userId: string,
  id: string,
): Promise<ProjectEntry> {
  const entries = await listProjects(userId);
  const entry = entries.find((row) => row.project.id === id);
  if (!entry) throw ApiError.notFound("Project not found.");
  return entry;
}

export async function submitProject(params: {
  userId: string;
  projectId: string;
  body: string;
  claimed: string[];
}): Promise<ProjectSubmission> {
  const entry = await getProjectEntry(params.userId, params.projectId);
  if (!entry.unlocked) throw ApiError.forbidden(entry.requirement);
  if (entry.submission?.status === "grading") {
    throw ApiError.conflict("That project is still being marked.");
  }

  const submission: ProjectSubmission = {
    id: newId("sub"),
    projectId: entry.project.id,
    userId: params.userId,
    subjectId: entry.project.subjectId,
    body: params.body,
    claimed: params.claimed,
    status: "grading",
    scores: [],
    score: 0,
    maxScore: entry.project.rubric.reduce((sum, row) => sum + row.points, 0),
    feedback: "",
    gradedAt: null,
    gradedBy: null,
    error: null,
    submittedAt: now(),
  };

  await db.submissions.insert(submission);
  await enqueue("grade_project", { submissionId: submission.id });

  return submission;
}

const gradeSchema = z.object({
  criteria: z.array(
    z.object({
      criterionId: z.string(),
      level: z.number().int().min(0).max(3),
      note: z.string(),
    }),
  ),
  feedback: z.string(),
});

function checklistGrade(
  project: Project,
  submission: ProjectSubmission,
): { scores: CriterionScore[]; feedback: string } {
  const thin = submission.body.trim().length < MIN_BODY;

  const scores = project.rubric.map((criterion) => {
    const claimed = submission.claimed.includes(criterion.id);
    const level = thin ? Math.min(1, claimed ? 1 : 0) : claimed ? 2 : 1;

    return {
      criterionId: criterion.id,
      level,
      points: Math.round((criterion.points * level) / 3),
      note: claimed
        ? "You said you did this one."
        : "You did not tick this one, so it scores low.",
    };
  });

  return {
    scores,
    feedback: thin
      ? "This was marked against your own checklist because there is no marker available right now. It is quite short — a longer piece would score higher when a teacher looks at it."
      : "This was marked against your own checklist because there is no marker available right now. A teacher can re-mark it and the score will change.",
  };
}

async function aiGrade(
  project: Project,
  submission: ProjectSubmission,
): Promise<{ scores: CriterionScore[]; feedback: string }> {
  const rubric = project.rubric
    .map(
      (criterion) =>
        `${criterion.id} — ${criterion.title}: ${criterion.description}\n` +
        criterion.levels.map((level, index) => `  ${index}: ${level}`).join("\n"),
    )
    .join("\n\n");

  const result = await generateObject({
    schema: gradeSchema,
    schemaName: "project_grade",
    system: `You are marking a school project as UVBrain's teacher for a learner around ten years old.

- Mark each criterion at the level whose wording actually matches the work, 0 to 3.
- Be accurate, not kind. An inflated score teaches nothing.
- Never mark down for spelling, handwriting or length on its own.
- Every note is one sentence, addressed to the learner, and names something specific in their work.
- Notice real strengths, but do not praise filler.
- The feedback is two sentences: what worked, then the single most useful thing to do next time.
- Keep the voice teacherly, direct, and age-respectful: clear enough for a ten-year-old, never cutesy.`,
    prompt: `The task set was:\n${project.prompt}\n\nThe rubric:\n${rubric}\n\nThe learner's work:\n${submission.body}`,
    effort: "medium",
  });

  const byId = new Map(result.criteria.map((row) => [row.criterionId, row]));

  return {
    scores: project.rubric.map((criterion) => {
      const marked = byId.get(criterion.id);
      const level = Math.max(0, Math.min(3, marked?.level ?? 0));
      return {
        criterionId: criterion.id,
        level,
        points: Math.round((criterion.points * level) / 3),
        note: marked?.note ?? "This one was not marked.",
      };
    }),
    feedback: result.feedback,
  };
}

registerJobHandler("grade_project", async (payload) => {
  const submission = await db.submissions.get(payload.submissionId);
  if (!submission) return;

  const project = await db.projects.get(submission.projectId);
  if (!project) return;

  try {
    const graded = isAiEnabled()
      ? await aiGrade(project, submission)
      : checklistGrade(project, submission);

    await db.submissions.update(submission.id, {
      status: "scored",
      scores: graded.scores,
      score: graded.scores.reduce((sum, row) => sum + row.points, 0),
      feedback: graded.feedback,
      gradedAt: now(),
      gradedBy: isAiEnabled() ? "ai" : "checklist",
      error: null,
    });
  } catch (error) {
    await db.submissions.update(submission.id, {
      status: "failed",
      error: error instanceof Error ? error.message : "Marking failed",
    });
    throw error;
  }
});
