import { z } from "zod";
import { generateObject, MODEL, isAiEnabled } from "@/lib/ai/client";
import { db, newId, now } from "@/lib/db";
import type { Lesson, Subject, Syllabus } from "@/lib/db/types";
import { enqueue, registerJobHandler } from "@/lib/jobs";
import { isCourseAnalysisEnabled } from "./config";
import type { CourseBrief } from "./types";

const briefSchema = z.object({
  overview: z.string(),
  bigIdeas: z.array(z.string()),
  throughLines: z.array(z.string()),
  keyTerms: z.array(z.object({ term: z.string(), gloss: z.string() })),
  commonMisconceptions: z.array(
    z.object({ belief: z.string(), correction: z.string() }),
  ),
  analogySeeds: z.array(z.string()),
  probeQuestions: z.array(z.string()),
});

export async function getBrief(subjectId: string, syllabusId?: string | null) {
  return db.courseBriefs.findOne(
    (brief) =>
      brief.subjectId === subjectId && brief.syllabusId === (syllabusId ?? null),
  );
}

export async function ensureBrief(params: {
  subjectId: string;
  syllabusId?: string | null;
}): Promise<CourseBrief | null> {
  if (!isCourseAnalysisEnabled()) return null;

  const existing = await getBrief(params.subjectId, params.syllabusId);
  if (existing) return existing;

  const brief: CourseBrief = {
    id: newId("brief"),
    subjectId: params.subjectId,
    syllabusId: params.syllabusId ?? null,
    status: "generating",
    error: null,
    overview: "",
    bigIdeas: [],
    throughLines: [],
    keyTerms: [],
    commonMisconceptions: [],
    analogySeeds: [],
    probeQuestions: [],
    model: MODEL,
    createdAt: now(),
    updatedAt: now(),
  };
  await db.courseBriefs.insert(brief);

  await enqueue("analyze_course", {
    briefId: brief.id,
  });
  return brief;
}

async function collectMaterial(
  subject: Subject,
  syllabus: Syllabus | null,
): Promise<string> {
  const parts: string[] = [`# Course: ${subject.name}`, subject.blurb];

  if (syllabus) {
    parts.push(`\n## Syllabus: ${syllabus.title} (level: ${syllabus.level})`);
    const ordered = [...syllabus.chapters].sort((a, b) => a.order - b.order);

    const lessons: Lesson[] = await db.lessons.find(
      (lesson) => lesson.syllabusId === syllabus.id && lesson.status === "ready",
    );
    const byChapter = new Map(lessons.map((lesson) => [lesson.chapterId, lesson]));

    for (const chapter of ordered) {
      parts.push(`\n### ${chapter.order}. ${chapter.title}\n${chapter.summary}`);
      if (chapter.objectives.length) {
        parts.push(chapter.objectives.map((o) => `- ${o}`).join("\n"));
      }

      const lesson = byChapter.get(chapter.id);
      if (lesson) {
        for (const slide of [...lesson.slides].sort((a, b) => a.order - b.order)) {
          parts.push(`\n**${slide.heading}**\n${slide.body.join("\n\n")}`);
          if (slide.interactive) {
            parts.push(`(practice: ${slide.interactive.prompt})`);
          }
        }
      }
    }
  }

  return parts.join("\n");
}

registerJobHandler("analyze_course", async (payload) => {
  const brief = await db.courseBriefs.get(payload.briefId);
  if (!brief) return;

  try {
    const subject = await db.subjects.get(brief.subjectId);
    if (!subject) throw new Error("Subject not found");

    const syllabus = brief.syllabusId ? await db.syllabi.get(brief.syllabusId) : null;
    const material = await collectMaterial(subject, syllabus);

    if (!isAiEnabled()) {
      await db.courseBriefs.update(brief.id, {
        status: "ready",
        overview: `${subject.name}: ${subject.blurb}`,
        bigIdeas: syllabus?.chapters.map((chapter) => chapter.title) ?? [],
        throughLines: [],
        keyTerms: [],
        commonMisconceptions: [],
        analogySeeds: [],
        probeQuestions: [],
        updatedAt: now(),
      });
      return;
    }

    const result = await generateObject({
      schema: briefSchema,
      schemaName: "course_brief",
      effort: "high",
      maxTokens: 16000,
      system: `You are UVBrain's teacher preparing to teach a whole course. Read the course material and build your own working teacher brief — not a summary for the learner, a planning document for the teacher who will guide lessons, review, assessment, remediation, and enrichment.

Bring what you know about the field and about teaching this subject to bear. If the material is thin in a place that matters, fill the gap from your own knowledge and make the connection explicit. If the material makes a claim that is contested or outdated in the field, note it as a misconception with the correction. Do not invent course coverage that is not in the material.

Be specific. "Important concepts" is useless; name them. Think like the teacher, advisor, assessor, and learning-support lead for this course.`,
      prompt: `${material}

Produce:
- overview: what this course is actually about and where it's going, in a short paragraph.
- bigIdeas: 3–6 ideas everything else hangs off.
- throughLines: ordered — what each part assumes from the parts before it, including prerequisites, dependencies, and where to slow down if the learner is missing an earlier idea.
- keyTerms: vocabulary the learner must own, each with a plain-language gloss a beginner would understand.
- commonMisconceptions: errors students reliably make in this material, each with the correction. Draw on what you know about teaching this subject, not only what the text says.
- analogySeeds: everyday things this material genuinely resembles — raw material for explanations across different ages and interests.
- probeQuestions: questions that reveal whether someone actually understands, rather than whether they can recite. Include questions useful for review, remediation, and deciding whether to move on.`,
    });

    await db.courseBriefs.update(brief.id, {
      status: "ready",
      error: null,
      ...result,
      updatedAt: now(),
    });
  } catch (error) {
    await db.courseBriefs.update(brief.id, {
      status: "failed",
      error: error instanceof Error ? error.message : "Analysis failed",
      updatedAt: now(),
    });
    throw error;
  }
});

export function formatBriefForPrompt(brief: CourseBrief | null): string {
  if (!brief || brief.status !== "ready") return "";

  const sections: string[] = [`## What you know about this course\n\n${brief.overview}`];

  if (brief.bigIdeas.length) {
    sections.push(`Big ideas:\n${brief.bigIdeas.map((idea) => `- ${idea}`).join("\n")}`);
  }
  if (brief.throughLines.length) {
    sections.push(
      `Teaching path and dependencies:\n${brief.throughLines.map((line) => `- ${line}`).join("\n")}`,
    );
  }
  if (brief.keyTerms.length) {
    sections.push(
      `Key terms:\n${brief.keyTerms.map((term) => `- ${term.term}: ${term.gloss}`).join("\n")}`,
    );
  }
  if (brief.commonMisconceptions.length) {
    sections.push(
      `Errors students reliably make here:\n${brief.commonMisconceptions
        .map((item) => `- They think: ${item.belief}\n  Actually: ${item.correction}`)
        .join("\n")}`,
    );
  }
  if (brief.analogySeeds.length) {
    sections.push(
      `Analogies that fit this material:\n${brief.analogySeeds.map((seed) => `- ${seed}`).join("\n")}`,
    );
  }
  if (brief.probeQuestions.length) {
    sections.push(
      `Questions that reveal real understanding:\n${brief.probeQuestions.map((question) => `- ${question}`).join("\n")}`,
    );
  }

  return sections.join("\n\n");
}
