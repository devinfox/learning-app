import { chaptersForLevel, getPack } from "@/lib/courses";
import type { PackChapter, PackQuestion } from "@/lib/courses/types";
import type { Level, Subject } from "@/lib/db/types";
import { generateObject, isAiEnabled } from "./client";
import {
  lessonSchema,
  quizSchema,
  syllabusSchema,
  type GeneratedLesson,
  type GeneratedQuiz,
  type GeneratedSyllabus,
} from "./schemas";

const HOUSE_STYLE = `Write like a subject expert designing school-quality material for a learner at the requested level.

- Lead with the idea, then the example. No throat-clearing, no "in this lesson we will".
- Match the vocabulary, prior knowledge, reading load, and depth to the learner level in the request. Do not write for adults unless the requested level implies it.
- Use real terminology, then make it clear. Do not baby the learner, and do not hide the proper name of the idea.
- Concrete over abstract. Use real examples from the field, named correctly.
- Do not pad. A slide with two strong paragraphs beats one with five weak ones.
- Never use filler prose, lorem ipsum, or placeholder text.
- Do not assess a concept before it has been taught, unless the call is explicitly a placement assessment.
- Interactive checks must test understanding of what the slide just taught, not recall of a definition stated verbatim.
- Every interactive check must be answerable from the immediately preceding material plus reasonable prior knowledge for this level.
- For "drag_drop", "options" holds the items in scrambled order and "answer" is the list of indices in their correct order.
- For "mcq" and "true_false", "answer" is a single-element array holding the index of the correct option.
- Distractors must be plausible to someone who half-understands the material.
- Explanations should say why the correct answer is right and why the strongest wrong answer is tempting but wrong.`;

function systemFor(subject: Subject, level: Level): string {
  return `You are writing course material for UVBrain, a full learning environment where the AI teacher guides the learner across subjects. Subject: ${subject.name}. Learner level: ${level}.`;
}

export interface SyllabusDraft {
  title: string;
  chapters: Array<{
    title: string;
    summary: string;
    objectives: string[];
    misconceptions?: Array<{ belief: string; correction: string }>;
  }>;
}

export async function generateSyllabus(params: {
  subject: Subject;
  level: Level;
}): Promise<SyllabusDraft> {
  const { subject, level } = params;

  if (!isAiEnabled()) {
    const pack = getPack(subject.slug, subject.name);
    return {
      title: pack.title,
      chapters: chaptersForLevel(pack, level).map((chapter) => ({
        title: chapter.title,
        summary: chapter.summary,
        objectives: chapter.objectives,
        misconceptions: chapter.misconceptions,
      })),
    };
  }

  const result: GeneratedSyllabus = await generateObject({
    schema: syllabusSchema,
    schemaName: "syllabus",
    system: systemFor(subject, level),
    cachedContext: HOUSE_STYLE,
    effort: "high",
    prompt: `Design a syllabus in ${subject.name} for a ${level} learner.

Produce 5 to 8 chapters that build on each other like a real course path. Each chapter needs a specific title (not "Chapter 3"), a one-sentence summary, and 3 concrete learning objectives phrased as things the learner will be able to do.

Start where a ${level} learner actually is — do not re-teach material they have already placed out of. Include enough foundation that UVBrain's teacher can diagnose gaps and recover them without derailing the course.`,
  });

  return result;
}

export interface LessonDraft {
  title: string;
  slides: Array<{
    heading: string;
    body: string[];
    image: { url: string; caption: string } | null;
    reading: {
      title: string;
      attribution: string;
      body: string[];
      guidingQuestions: string[];
    } | null;
    interactive: {
      kind: "mcq" | "true_false" | "drag_drop";
      prompt: string;
      options: string[];
      answer: number[];
      explanation: string;
    } | null;
  }>;
  quiz: Array<{
    prompt: string;
    options: string[];
    answerIndex: number;
    explanation: string;
  }>;
}

export async function generateLesson(params: {
  subject: Subject;
  level: Level;
  chapterTitle: string;
  chapterSummary: string;
  objectives: string[];
  precedingChapters: string[];
}): Promise<LessonDraft> {
  const { subject, level, chapterTitle } = params;

  if (!isAiEnabled()) {
    const pack = getPack(subject.slug, subject.name);
    const chapter =
      pack.chapters.find((candidate) => candidate.title === chapterTitle) ??
      chaptersForLevel(pack, level)[0] ??
      pack.chapters[0];
    return fromPackChapter(chapter);
  }

  const result: GeneratedLesson = await generateObject({
    schema: lessonSchema,
    schemaName: "lesson",
    system: systemFor(subject, level),
    cachedContext: HOUSE_STYLE,
    effort: "high",
    maxTokens: 16000,
    prompt: `Write the lesson for the chapter "${chapterTitle}".

Summary: ${params.chapterSummary}
Objectives:
${params.objectives.map((objective) => `- ${objective}`).join("\n")}
${
  params.precedingChapters.length > 0
    ? `\nAlready covered in earlier chapters (build on these, don't repeat them):\n${params.precedingChapters.map((title) => `- ${title}`).join("\n")}`
    : ""
}

Produce 3 to 5 slides. Each slide has a heading and 1 to 3 body paragraphs. Each slide should teach one clear move in the chapter, building toward the objectives. At least two slides must carry an interactive check, and across the lesson use at least two different interactive kinds. Set "interactive" to null on slides without one.

Then write a 3 to 5 question end-of-lesson quiz covering the whole chapter, with 4 options each. The quiz should reveal misconceptions the teacher can remediate, not just whether the learner remembers wording.`,
  });

  return {
    title: result.title,
    slides: result.slides.map((slide) => ({
      heading: slide.heading,
      body: slide.body,
      image: null,
      reading: null,
      interactive: slide.interactive,
    })),
    quiz: result.quiz,
  };
}

export interface QuizDraft {
  title: string;
  questions: Array<{
    prompt: string;
    options: string[];
    answerIndex: number;
    explanation: string;
  }>;
}

export async function generatePlacementQuiz(params: {
  subject: Subject;
}): Promise<QuizDraft> {
  const { subject } = params;

  if (!isAiEnabled()) {
    const pack = getPack(subject.slug, subject.name);
    return {
      title: `${subject.name} Placement Check`,
      questions: pack.placement.map(toDraftQuestion),
    };
  }

  const result: GeneratedQuiz = await generateObject({
    schema: quizSchema,
    schemaName: "placement_quiz",
    system: `You are writing a placement assessment for UVBrain, a full learning environment where the AI teacher must start the learner in the right place. Subject: ${subject.name}.`,
    cachedContext: HOUSE_STYLE,
    effort: "high",
    prompt: `Write a 6-question placement check for ${subject.name}.

The purpose is to separate beginners from intermediate and advanced learners, so grade the difficulty: roughly two questions any interested newcomer could answer, two requiring real study, and two that only someone with genuine depth would get. Order them easiest first. Four options each, exactly one correct. Explanations should reveal what the answer says about readiness, without shaming the learner.`,
  });

  return result;
}

export async function generateLessonQuiz(params: {
  subject: Subject;
  level: Level;
  chapterTitle: string;
  slideHeadings: string[];
}): Promise<QuizDraft> {
  const { subject, level, chapterTitle } = params;

  if (!isAiEnabled()) {
    const pack = getPack(subject.slug, subject.name);
    const chapter = pack.chapters.find((candidate) => candidate.title === chapterTitle);
    return {
      title: `${chapterTitle} Quiz`,
      questions: (chapter?.quiz ?? []).map(toDraftQuestion),
    };
  }

  const result: GeneratedQuiz = await generateObject({
    schema: quizSchema,
    schemaName: "lesson_quiz",
    system: systemFor(subject, level),
    cachedContext: HOUSE_STYLE,
    effort: "medium",
    prompt: `Write a 4-question quiz for the chapter "${chapterTitle}", which covered:
${params.slideHeadings.map((heading) => `- ${heading}`).join("\n")}

Four options each, exactly one correct. Test understanding, not recall of phrasing. Make the wrong options diagnose likely misunderstandings from this lesson.`,
  });

  return result;
}

function toDraftQuestion(question: PackQuestion) {
  return {
    prompt: question.prompt,
    options: question.options,
    answerIndex: question.answerIndex,
    explanation: question.explanation,
  };
}

function fromPackChapter(chapter: PackChapter): LessonDraft {
  return {
    title: chapter.title,
    slides: chapter.slides.map((slide) => ({
      heading: slide.heading,
      body: slide.body,
      image: slide.image ?? null,
      reading: slide.reading ?? null,
      interactive: slide.interactive
        ? {
            kind: slide.interactive.kind,
            prompt: slide.interactive.prompt,
            options: slide.interactive.options,
            answer: slide.interactive.answer,
            explanation: slide.interactive.explanation,
          }
        : null,
    })),
    quiz: chapter.quiz.map(toDraftQuestion),
  };
}
