import { getPack, hasPack } from "@/lib/courses";
import type { CoursePack } from "@/lib/courses/types";
import { db, newId, now } from "@/lib/db";
import type { Attempt, Chapter, Question, Quiz, Syllabus } from "@/lib/db/types";
import { ApiError } from "@/lib/http";
import { getSubject } from "./catalog";
import { POINTS_PER_QUESTION } from "./courses";
import { subjectMastery } from "./mastery";

export const UNIT_SIZE = 3;

const PER_CHAPTER_UNIT = 3;
const PER_CHAPTER_FINAL = 2;
const FINAL_CAP = 20;

export interface ExamEntry {
  id: string;
  kind: "exam" | "final";
  unit: number | null;
  title: string;
  subjectId: string;
  syllabusId: string;
  chapterTitles: string[];
  unlocked: boolean;
  requirement: string;
  questionCount: number;
  attempts: number;
  best: {
    score: number;
    maxScore: number;
    percent: number;
    passed: boolean;
    at: string;
  } | null;
}

function unitsOf(chapters: Chapter[]): Chapter[][] {
  const ordered = [...chapters].sort((a, b) => a.order - b.order);
  const blocks: Chapter[][] = [];
  for (let index = 0; index < ordered.length; index += UNIT_SIZE) {
    blocks.push(ordered.slice(index, index + UNIT_SIZE));
  }
  return blocks;
}

export function examId(syllabusId: string, unit: number | "final"): string {
  return unit === "final" ? `exm_${syllabusId}_final` : `exm_${syllabusId}_u${unit}`;
}

async function poolFor(chapter: Chapter, pack: CoursePack | null): Promise<Question[]> {
  if (chapter.lessonId) {
    const lesson = await db.lessons.get(chapter.lessonId);
    if (lesson?.quizId) {
      const quiz = await db.quizzes.get(lesson.quizId);
      if (quiz && quiz.questions.length > 0) {
        return [...quiz.questions].sort((a, b) => a.order - b.order);
      }
    }
  }

  const authored = pack?.chapters.find((row) => row.title === chapter.title);
  if (!authored) return [];

  return authored.quiz.map((question, index) => ({
    id: `${chapter.id}_${index}`,
    order: index + 1,
    prompt: question.prompt,
    options: question.options,
    answerIndex: question.answerIndex,
    explanation: question.explanation,
    points: POINTS_PER_QUESTION,
  }));
}

async function questionsFor(
  chapters: Chapter[],
  perChapter: number,
  pack: CoursePack | null,
): Promise<Question[]> {
  const picked: Question[] = [];
  const seen = new Set<string>();

  for (const chapter of chapters) {
    const ordered = await poolFor(chapter, pack);
    if (ordered.length === 0) continue;

    const stride = Math.max(1, Math.floor(ordered.length / perChapter));
    let taken = 0;

    for (
      let index = 0;
      index < ordered.length && taken < perChapter && picked.length < FINAL_CAP;
      index += stride
    ) {
      const question = ordered[index];
      if (seen.has(question.prompt)) continue;
      seen.add(question.prompt);
      picked.push(question);
      taken += 1;
    }
  }

  return picked.map((question, index) => ({
    ...question,
    id: newId("q"),
    order: index + 1,
  }));
}

async function packFor(subjectId: string): Promise<CoursePack | null> {
  const subject = await getSubject(subjectId);
  return hasPack(subject.slug) ? getPack(subject.slug, subject.name) : null;
}

export async function examPlan(
  userId: string,
  syllabus: Syllabus,
): Promise<ExamEntry[]> {
  const mastery = await subjectMastery(userId, syllabus);
  const passedByChapter = new Map(
    mastery.chapters.map((row) => [row.chapterId, row.passedAttempts > 0]),
  );

  const blocks = unitsOf(syllabus.chapters);
  const pack = await packFor(syllabus.subjectId);
  const attempts = await db.attempts.find(
    (row) =>
      row.userId === userId &&
      row.submittedAt !== null &&
      (row.kind === "exam" || row.kind === "final"),
  );

  const pools = new Map<string, number>();
  for (const chapter of syllabus.chapters) {
    pools.set(chapter.id, (await poolFor(chapter, pack)).length);
  }

  const drawable = (chapters: Chapter[], perChapter: number) =>
    chapters.reduce(
      (sum, chapter) => sum + Math.min(perChapter, pools.get(chapter.id) ?? 0),
      0,
    );

  const summarise = (quizId: string) => {
    const rows = attempts.filter((row) => row.quizId === quizId);
    if (rows.length === 0) return { attempts: 0, best: null };

    const best = rows.reduce((top: Attempt, row) => (row.score > top.score ? row : top));

    return {
      attempts: rows.length,
      best: {
        score: best.score,
        maxScore: best.maxScore,
        percent:
          best.maxScore > 0 ? Math.round((best.score / best.maxScore) * 100) : 0,
        passed: best.passed,
        at: best.submittedAt!,
      },
    };
  };

  const entries: ExamEntry[] = blocks.map((block, index) => {
    const unit = index + 1;
    const id = examId(syllabus.id, unit);
    const outstanding = block.filter((chapter) => !passedByChapter.get(chapter.id));
    const questionCount = drawable(block, PER_CHAPTER_UNIT);

    return {
      id,
      kind: "exam" as const,
      unit,
      title: `Unit ${unit} Exam`,
      subjectId: syllabus.subjectId,
      syllabusId: syllabus.id,
      chapterTitles: block.map((chapter) => chapter.title),
      unlocked: outstanding.length === 0 && questionCount > 0,
      requirement:
        questionCount === 0
          ? "Waiting on this unit's lessons to be written"
          : outstanding.length === 0
            ? "Ready when you are"
            : outstanding.length === 1
              ? `Pass ${outstanding[0].title} first`
              : `Pass ${outstanding.length} more lesson quizzes in this unit`,
      questionCount,
      ...summarise(id),
    };
  });

  if (blocks.length > 1) {
    const allPassed = syllabus.chapters.every((chapter) =>
      passedByChapter.get(chapter.id),
    );
    const unitsPassed = entries.filter((entry) => entry.best?.passed).length;
    const questionCount = Math.min(
      FINAL_CAP,
      drawable(syllabus.chapters, PER_CHAPTER_FINAL),
    );
    const ready = allPassed && unitsPassed === entries.length && questionCount > 0;
    const id = examId(syllabus.id, "final");

    entries.push({
      id,
      kind: "final",
      unit: null,
      title: `${syllabus.title} Final Exam`,
      subjectId: syllabus.subjectId,
      syllabusId: syllabus.id,
      chapterTitles: syllabus.chapters.map((chapter) => chapter.title),
      unlocked: ready,
      requirement:
        questionCount === 0
          ? "Waiting on this course's lessons to be written"
          : ready
            ? "Everything you have covered, once"
            : allPassed
              ? "Pass every unit exam first"
              : "Finish the whole course first",
      questionCount,
      ...summarise(id),
    });
  }

  return entries;
}

export async function ensureExam(params: {
  userId: string;
  syllabusId: string;
  unit: number | "final";
}): Promise<Quiz> {
  const syllabus = await db.syllabi.get(params.syllabusId);
  if (!syllabus) throw ApiError.notFound("Course not found.");
  if (syllabus.userId !== params.userId) throw ApiError.forbidden();

  const plan = await examPlan(params.userId, syllabus);
  const entry = plan.find((row) =>
    params.unit === "final" ? row.kind === "final" : row.unit === params.unit,
  );
  if (!entry) throw ApiError.notFound("Exam not found.");
  if (!entry.unlocked) throw ApiError.forbidden(entry.requirement);

  const id = examId(syllabus.id, params.unit);
  const existing = await db.quizzes.get(id);
  if (existing && existing.questions.length > 0) return existing;

  const blocks = unitsOf(syllabus.chapters);
  const chapters =
    params.unit === "final"
      ? [...syllabus.chapters].sort((a, b) => a.order - b.order)
      : (blocks[params.unit - 1] ?? []);

  const pack = await packFor(syllabus.subjectId);
  const questions = await questionsFor(
    chapters,
    params.unit === "final" ? PER_CHAPTER_FINAL : PER_CHAPTER_UNIT,
    pack,
  );

  if (params.unit === "final") {
    for (const authored of pack?.finalExam ?? []) {
      if (questions.length >= FINAL_CAP) break;
      questions.push({
        id: newId("q"),
        order: questions.length + 1,
        prompt: authored.prompt,
        options: authored.options,
        answerIndex: authored.answerIndex,
        explanation: authored.explanation,
        points: POINTS_PER_QUESTION,
      });
    }
  }

  if (questions.length === 0) {
    throw ApiError.conflict("This exam has nothing to draw on yet.");
  }

  const quiz: Quiz = {
    id,
    kind: params.unit === "final" ? "final" : "exam",
    userId: params.userId,
    subjectId: syllabus.subjectId,
    lessonId: null,
    title: entry.title,
    status: "ready",
    error: null,
    questions,
    createdAt: now(),
  };

  if (existing) {
    return (await db.quizzes.update(id, quiz)) ?? quiz;
  }

  await db.quizzes.insert(quiz);
  return quiz;
}
