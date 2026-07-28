import type { Level } from "@/lib/db/types";
import { history } from "./packs/history";
import { industrialRevolution } from "./packs/industrial-revolution";
import { lettersAndSounds } from "./packs/letters-and-sounds";
import { linguistics } from "./packs/linguistics";
import type { CoursePack, PackChapter } from "./types";

export type { CoursePack, PackChapter, PackQuestion, PackSlide } from "./types";

const PACKS: Record<string, CoursePack> = {
  linguistics,
  history,
  "industrial-revolution": industrialRevolution,
  "letters-k": lettersAndSounds,
};

const LEVEL_ORDER: Record<Level, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
};

export function hasPack(slug: string): boolean {
  return slug in PACKS;
}

export function getPack(slug: string, subjectName: string): CoursePack {
  return PACKS[slug] ?? scaffoldPack(slug, subjectName);
}

export function chaptersForLevel(pack: CoursePack, level: Level): PackChapter[] {
  const ceiling = LEVEL_ORDER[level];
  const withinLevel = pack.chapters.filter(
    (chapter) => LEVEL_ORDER[chapter.minLevel] <= ceiling,
  );

  if (level === "advanced" && withinLevel.length > 3) {
    const trimmed = withinLevel.filter((chapter) => chapter.minLevel !== "beginner");
    if (trimmed.length >= 3) return trimmed;
  }

  return withinLevel.length > 0 ? withinLevel : pack.chapters;
}

function scaffoldPack(slug: string, subjectName: string): CoursePack {
  const arc: Array<{ title: string; focus: string; minLevel: Level }> = [
    { title: `Foundations of ${subjectName}`, focus: "core vocabulary and the shape of the field", minLevel: "beginner" },
    { title: `Core Methods in ${subjectName}`, focus: "the techniques practitioners actually use", minLevel: "beginner" },
    { title: `Applying ${subjectName}`, focus: "working through realistic problems end to end", minLevel: "intermediate" },
    { title: `Advanced Topics in ${subjectName}`, focus: "open questions and contested ground", minLevel: "advanced" },
  ];

  return {
    subjectSlug: slug,
    title: subjectName,
    placement: [
      {
        prompt: `How would you describe your current experience with ${subjectName}?`,
        options: [
          "I have never studied it",
          "I know the basics",
          "I have studied it formally",
          "I work with it regularly",
        ],
        answerIndex: 1,
        explanation: "Self-report helps set a starting level while the full assessment is authored.",
        difficulty: "beginner",
      },
      {
        prompt: `Which best matches what you want from ${subjectName}?`,
        options: [
          "A broad introduction",
          "Filling specific gaps",
          "Depth in one area",
          "Practice and application",
        ],
        answerIndex: 0,
        explanation: "Goal shapes how the syllabus is sequenced.",
        difficulty: "beginner",
      },
      {
        prompt: `Have you previously completed structured coursework in ${subjectName}?`,
        options: ["No", "Some self-study", "A short course", "A full programme"],
        answerIndex: 1,
        explanation: "Prior coursework raises the starting level.",
        difficulty: "intermediate",
      },
    ],
    chapters: arc.map((step) => ({
      title: step.title,
      summary: `An overview of ${step.focus}.`,
      objectives: [
        `Explain the key ideas behind ${step.title.toLowerCase()}`,
        `Recognise where ${subjectName} applies these ideas`,
        "Complete a short practice check",
      ],
      minLevel: step.minLevel,
      slides: [
        {
          heading: step.title,
          body: [
            `This chapter covers ${step.focus}. Authored content for ${subjectName} has not been written yet, so this is scaffold text — the structure, navigation, progress tracking, and quiz flow all work exactly as they will with real content.`,
            `Connect an OpenAI API key to have this chapter generated, or add a course pack at lib/courses/packs/${slug}.ts.`,
          ],
          interactive: {
            kind: "true_false",
            prompt: `This chapter's content for ${subjectName} is scaffold text pending authoring.`,
            options: ["True", "False"],
            answer: [0],
            explanation: "Correct — the flow is real, the prose is placeholder.",
          },
        },
      ],
      quiz: [
        {
          prompt: `Which describes the focus of "${step.title}"?`,
          options: [
            step.focus,
            "Unrelated administrative detail",
            "A different subject entirely",
            "None of the above",
          ],
          answerIndex: 0,
          explanation: `This chapter is about ${step.focus}.`,
          difficulty: step.minLevel,
        },
      ],
    })),
  };
}
