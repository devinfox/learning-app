import { hashPassword } from "@/lib/auth/password";
import { getPack } from "@/lib/courses";
import { POINTS_PER_QUESTION } from "@/lib/services/courses";
import type { LearnerMemory } from "@/lib/tutor/types";
import { db, newId, now } from "./index";
import { clearLearner, daysAgo, inDays, seedSideCourse } from "./seed-support";
import type {
  Attempt,
  Chapter,
  Enrollment,
  Interactive,
  Lesson,
  Profile,
  Progress,
  Question,
  Quiz,
  Slide,
  Subject,
  Syllabus,
  User,
} from "./types";

const CHAD_EMAIL = "kid@uvbrain.local";
const CHAD_PASSWORD = "test123";

const CHAD_USER_ID = "usr_demo_chad";

export const DEMO_CLASSES = {
  history: { teacher: "Ms. Alvarez", period: "Period 3", room: "204" },
  math: { teacher: "Mr. Boateng", period: "Period 1", room: "112" },
  science: { teacher: "Ms. Alvarez", period: "Period 5", room: "Lab B" },
  reading: { teacher: "Mrs. Whitfield", period: "Period 2", room: "118" },
};

const DEMO_SUBJECTS: Subject[] = [
  {
    id: "sub_industrial_revolution",
    slug: "industrial-revolution",
    name: "The Industrial Revolution",
    icon: "monument",
    blurb: "How machines, factories and railways changed the way people lived and worked.",
  },
  {
    id: "sub_math_g4",
    slug: "math-g4",
    name: "Fractions and Fair Shares",
    icon: "sigma",
    blurb: "Halves, thirds and equal parts — and why fair sharing is really maths.",
  },
  {
    id: "sub_science_g4",
    slug: "science-g4",
    name: "Weather and Water",
    icon: "flask",
    blurb: "Clouds, rain, rivers and the water cycle that connects them.",
  },
  {
    id: "sub_reading_g4",
    slug: "reading-g4",
    name: "Reading Between the Lines",
    icon: "translate",
    blurb: "Finding what a story says, and what it only hints at.",
  },
];

const LIFE_KINDS = new Set(["plan", "life", "circumstance"]);

function chadMemories(userId: string, subjectId: string): LearnerMemory[] {
  const base = {
    userId,
    sourceChatId: null,
    retiredAt: null,
  };

  const rows: Array<Partial<LearnerMemory> & { kind: LearnerMemory["kind"]; content: string }> = [
    {
      kind: "strength",
      content:
        "Once a concept lands he goes further with it than most — he starts asking the next question himself, often one I was going to raise.",
      confidence: 0.9,
      reinforcedCount: 4,
    },
    {
      kind: "struggle",
      content:
        "The first explanation almost never lands. He needs it broken into smaller steps than most learners before it clicks — but once it does, it holds.",
      confidence: 0.92,
      reinforcedCount: 5,
    },
    {
      kind: "preference",
      content:
        "Analogies work where definitions don't. Give him a picture he can hold first, then the real word for it.",
      confidence: 0.88,
      reinforcedCount: 4,
    },
    {
      kind: "struggle",
      content:
        "Gets discouraged if it doesn't click on the first try. Worth saying plainly that the second pass is normal, before he decides he's bad at it.",
      confidence: 0.75,
      reinforcedCount: 2,
    },
    {
      kind: "analogy",
      content:
        "Comparing a factory to a school bell schedule made 'the factory system' click — someone else decides when you start, stop and eat.",
      concept: "the factory system",
      confidence: 0.85,
      reinforcedCount: 2,
    },
    {
      kind: "analogy",
      content:
        "Explaining that a bad rule can stay legal for a long time using 'a game where the rules are unfair and nobody changes them yet' worked for why child labour wasn't stopped sooner.",
      concept: "why reform was slow",
      confidence: 0.8,
      reinforcedCount: 1,
    },
    {
      kind: "interest",
      content: "Builds a lot in Minecraft — especially redstone contraptions and moving things around.",
      confidence: 0.9,
      reinforcedCount: 3,
    },
    {
      kind: "interest",
      content: "Plays soccer on Saturdays and cares a great deal about whether things are fair.",
      confidence: 0.8,
      reinforcedCount: 2,
    },
    {
      kind: "interest",
      content: "Excited about starting middle school. Do not talk to him like a little kid.",
      confidence: 0.85,
      reinforcedCount: 2,
    },
    {
      kind: "misconception",
      content:
        "Thought factories appeared all at once and immediately replaced work at home. Corrected — the change was slow and uneven — but worth re-checking.",
      concept: "pace of industrialisation",
      confidence: 0.7,
      reinforcedCount: 1,
    },
    {
      kind: "life",
      content: "Plays left mid for his soccer team. They were undefeated as of last month.",
      confidence: 0.85,
      reinforcedCount: 2,
      horizon: "episodic" as const,
      expiresAt: inDays(110),
    },
    {
      kind: "plan",
      content:
        "Said on Friday he was going to his grandparents' lake house for the weekend, and that he and his grandma were going to make cookies.",
      confidence: 0.9,
      reinforcedCount: 0,
      horizon: "episodic" as const,
      followUpAt: daysAgo(1),
      followedUpAt: null,
      expiresAt: inDays(20),
      createdAt: daysAgo(4),
      updatedAt: daysAgo(4),
    },
    {
      kind: "circumstance",
      content:
        "Told me in March that his grandad died. He brought it up once and did not want to talk about it further.",
      confidence: 0.95,
      reinforcedCount: 0,
      horizon: "enduring" as const,
      sensitive: true,
      createdAt: daysAgo(120),
      updatedAt: daysAgo(120),
    },
  ];

  return rows.map((row, index) => ({
    id: newId("mem"),
    concept: null,
    subjectId:
      row.kind === "interest" || LIFE_KINDS.has(row.kind) ? null : subjectId,
    confidence: 0.7,
    reinforcedCount: 0,
    horizon: "enduring" as const,
    expiresAt: null,
    followUpAt: null,
    followedUpAt: null,
    sensitive: false,
    createdAt: daysAgo(20 - index),
    updatedAt: daysAgo(Math.max(1, 10 - index)),
    ...base,
    ...row,
  })) as LearnerMemory[];
}

export interface DemoSeedResult {
  login: { username: string; email: string; password: string };
  userId: string;
  subjects: number;
  syllabusId: string;
  completedLesson: string;
  currentLesson: string;
  memories: number;
}

export async function seedDemoLearner(): Promise<DemoSeedResult> {
  await clearLearner({ email: CHAD_EMAIL, userId: CHAD_USER_ID });

  const catalog = await db.subjects.all();
  const known = new Set(catalog.map((subject) => subject.id));
  const missing = DEMO_SUBJECTS.filter((subject) => !known.has(subject.id));
  if (missing.length) await db.subjects.insertMany(missing);

  const user: User = {
    id: CHAD_USER_ID,
    email: CHAD_EMAIL,
    passwordHash: await hashPassword(CHAD_PASSWORD),
    provider: "password",
    emailVerified: true,
    createdAt: daysAgo(30),
    updatedAt: now(),
  };
  await db.users.insert(user);

  const profile: Profile & { id: string } = {
    id: user.id,
    userId: user.id,
    name: "Chad",
    pronouns: "he/him",
    birthYear: new Date().getFullYear() - 9,
    avatarUrl: null,
    locale: "en",
    theme: "light",
    onboardedAt: daysAgo(30),
  };
  await db.profiles.insert(profile);

  const historySubject = DEMO_SUBJECTS[0];
  const pack = getPack(historySubject.slug, historySubject.name);

  const chapters: Chapter[] = pack.chapters.map((chapter, index) => ({
    id: newId("ch"),
    order: index + 1,
    title: chapter.title,
    summary: chapter.summary,
    objectives: chapter.objectives,
    misconceptions: chapter.misconceptions ?? [],
    lessonId: null,
    lessonStatus: "pending",
  }));

  const syllabus: Syllabus = {
    id: newId("syl"),
    userId: user.id,
    subjectId: historySubject.id,
    level: "beginner",
    title: pack.title,
    status: "ready",
    error: null,
    chapters,
    glossary: pack.glossary ?? [],
    timeline: pack.timeline ?? [],
    createdAt: daysAgo(21),
    updatedAt: daysAgo(21),
  };
  await db.syllabi.insert(syllabus);

  async function buildLesson(index: number, createdDaysAgo: number) {
    const packChapter = pack.chapters[index];
    const chapter = chapters[index];

    const slides: Slide[] = packChapter.slides.map((slide, slideIndex) => ({
      id: newId("sld"),
      order: slideIndex + 1,
      heading: slide.heading,
      body: slide.body,
      image: slide.image ?? null,
      reading: slide.reading ?? null,
      interactive: slide.interactive
        ? ({ id: newId("int"), ...slide.interactive } satisfies Interactive)
        : null,
    }));

    const quiz: Quiz = {
      id: newId("qz"),
      kind: "lesson",
      userId: user.id,
      subjectId: historySubject.id,
      lessonId: "",
      title: `${packChapter.title} Quiz`,
      status: "ready",
      error: null,
      questions: packChapter.quiz.map(
        (question, order): Question => ({
          id: newId("q"),
          order: order + 1,
          prompt: question.prompt,
          options: question.options,
          answerIndex: question.answerIndex,
          explanation: question.explanation,
          points: POINTS_PER_QUESTION,
        }),
      ),
      createdAt: daysAgo(createdDaysAgo),
    };

    const lesson: Lesson = {
      id: newId("les"),
      syllabusId: syllabus.id,
      chapterId: chapter.id,
      userId: user.id,
      subjectId: historySubject.id,
      title: packChapter.title,
      status: "ready",
      error: null,
      slides,
      quizId: quiz.id,
      createdAt: daysAgo(createdDaysAgo),
      updatedAt: daysAgo(createdDaysAgo),
    };

    quiz.lessonId = lesson.id;
    await db.quizzes.insert(quiz);
    await db.lessons.insert(lesson);

    await db.syllabi.mutate(syllabus.id, (row) => ({
      ...row,
      chapters: row.chapters.map((candidate) =>
        candidate.id === chapter.id
          ? { ...candidate, lessonId: lesson.id, lessonStatus: "ready" as const }
          : candidate,
      ),
    }));

    return { lesson, quiz, chapter };
  }

  const lessonOne = await buildLesson(0, 14);
  const lessonTwo = await buildLesson(1, 3);

  const completedProgress: Progress = {
    id: newId("prg"),
    userId: user.id,
    syllabusId: syllabus.id,
    chapterId: lessonOne.chapter.id,
    lessonId: lessonOne.lesson.id,
    slideIndex: lessonOne.lesson.slides.length - 1,
    slideCount: lessonOne.lesson.slides.length,
    attemptedInteractiveIds: lessonOne.lesson.slides
      .map((slide) => slide.interactive?.id)
      .filter((id): id is string => Boolean(id)),
    completed: true,
    completedAt: daysAgo(12),
    updatedAt: daysAgo(12),
  };
  await db.progress.insert(completedProgress);

  const answers: Record<string, number> = {};
  lessonOne.quiz.questions.forEach((question, index) => {
    answers[question.id] =
      index === 2 ? (question.answerIndex + 1) % question.options.length : question.answerIndex;
  });
  const correctCount = lessonOne.quiz.questions.filter(
    (question) => answers[question.id] === question.answerIndex,
  ).length;
  const maxScore = lessonOne.quiz.questions.length * POINTS_PER_QUESTION;
  const score = correctCount * POINTS_PER_QUESTION;

  const attempt: Attempt = {
    id: newId("att"),
    userId: user.id,
    quizId: lessonOne.quiz.id,
    kind: "lesson",
    subjectId: historySubject.id,
    startedAt: daysAgo(12),
    submittedAt: daysAgo(12),
    answers,
    correctCount,
    totalQuestions: lessonOne.quiz.questions.length,
    score,
    maxScore,
    durationSeconds: 384,
    passed: maxScore > 0 && score / maxScore >= 0.6,
  };
  await db.attempts.insert(attempt);

  await db.progress.insert({
    id: newId("prg"),
    userId: user.id,
    syllabusId: syllabus.id,
    chapterId: lessonTwo.chapter.id,
    lessonId: lessonTwo.lesson.id,
    slideIndex: 1,
    slideCount: lessonTwo.lesson.slides.length,
    attemptedInteractiveIds: lessonTwo.lesson.slides
      .slice(0, 1)
      .map((slide) => slide.interactive?.id)
      .filter((id): id is string => Boolean(id)),
    completed: false,
    completedAt: null,
    updatedAt: daysAgo(2),
  });

  const mathsSyllabusId = await seedSideCourse({
    userId: user.id,
    subject: DEMO_SUBJECTS[1],
    startedDaysAgo: 30,
    chapters: [
      {
        title: "Halves and Quarters",
        summary: "Splitting one thing into equal parts.",
        completedDaysAgo: 28,
        attempts: [
          { daysAgo: 28, passed: true },
          { daysAgo: 20, passed: true },
        ],
      },
      {
        title: "Thirds, Fifths and Awkward Numbers",
        summary: "When the pieces don't come out neatly.",
        completedDaysAgo: 24,
        attempts: [
          { daysAgo: 24, passed: false },
          { daysAgo: 23, passed: true },
        ],
      },
      {
        title: "Comparing Fractions",
        summary: "Which slice is actually bigger.",
        completedDaysAgo: 4,
        attempts: [{ daysAgo: 4, passed: true }],
      },
      {
        title: "Fractions of a Group",
        summary: "Two thirds of twelve apples.",
        completedDaysAgo: null,
        attempts: [],
      },
    ],
  });

  const scienceSyllabusId = await seedSideCourse({
    userId: user.id,
    subject: DEMO_SUBJECTS[2],
    startedDaysAgo: 35,
    chapters: [
      {
        title: "Where Rain Comes From",
        summary: "Evaporation, clouds, and the trip back down.",
        completedDaysAgo: 33,
        attempts: [
          { daysAgo: 33, passed: true },
          { daysAgo: 2, passed: true },
        ],
      },
      {
        title: "Rivers and Where They Go",
        summary: "Downhill, always downhill.",
        completedDaysAgo: 26,
        attempts: [{ daysAgo: 26, passed: true }],
      },
      {
        title: "Reading the Sky",
        summary: "What clouds tell you before the weather arrives.",
        completedDaysAgo: 19,
        attempts: [{ daysAgo: 19, passed: true }],
      },
    ],
  });

  const revisionQuizzes = await db.quizzes.find(
    (row) => row.userId === user.id && row.subjectId === DEMO_SUBJECTS[2].id,
  );
  const REVISION_DAYS = [32, 31, 30, 25, 18, 17, 16, 15, 14, 3];

  for (const [index, day] of REVISION_DAYS.entries()) {
    const quiz = revisionQuizzes[index % Math.max(1, revisionQuizzes.length)];
    if (!quiz) break;
    await db.attempts.insert({
      id: newId("att"),
      userId: user.id,
      quizId: quiz.id,
      kind: "lesson",
      subjectId: quiz.subjectId,
      startedAt: daysAgo(day),
      submittedAt: daysAgo(day),
      answers: {},
      correctCount: 4,
      totalQuestions: 4,
      score: 4 * POINTS_PER_QUESTION,
      maxScore: 4 * POINTS_PER_QUESTION,
      durationSeconds: 210,
      passed: true,
    });
  }

  const SIDE_SYLLABUS: Array<string | null> = [mathsSyllabusId, scienceSyllabusId, null];

  const enrollments: Enrollment[] = [
    {
      id: newId("enr"),
      userId: user.id,
      subjectId: historySubject.id,
      addedAt: daysAgo(21),
      placementStatus: "completed",
      placementScore: 40,
      level: "beginner",
      syllabusId: syllabus.id,
    },
    ...DEMO_SUBJECTS.slice(1).map((subject, index) => ({
      id: newId("enr"),
      userId: user.id,
      subjectId: subject.id,
      addedAt: daysAgo(30 - index * 4),
      placementStatus: index === 2 ? ("pending" as const) : ("completed" as const),
      placementScore: index === 2 ? null : 60,
      level: index === 2 ? null : ("beginner" as const),
      syllabusId: SIDE_SYLLABUS[index] ?? null,
    })),
  ];
  await db.enrollments.insertMany(enrollments);

  const memories = chadMemories(user.id, historySubject.id);
  await db.learnerMemories.insertMany(memories);

  return {
    login: { username: "kid", email: CHAD_EMAIL, password: CHAD_PASSWORD },
    userId: user.id,
    subjects: DEMO_SUBJECTS.length,
    syllabusId: syllabus.id,
    completedLesson: lessonOne.lesson.title,
    currentLesson: lessonTwo.lesson.title,
    memories: memories.length,
  };
}
