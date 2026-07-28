import { hashPassword } from "@/lib/auth/password";
import { getPack } from "@/lib/courses";
import { POINTS_PER_QUESTION } from "@/lib/services/courses";
import type { LearnerMemory } from "@/lib/tutor/types";
import { db, newId, now } from "./index";
import { clearLearner, daysAgo, inDays, seedSideCourse } from "./seed-support";
import type {
  Attempt,
  Chapter,
  CompanionState,
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

const EMMA_EMAIL = "emma@uvbrain.local";
const EMMA_PASSWORD = "test123";

const EMMA_USER_ID = "usr_demo_emma";

export const EMMA_CLASSES = {
  letters: { teacher: "Miss Okafor", period: "Morning circle", room: "K-2" },
  counting: { teacher: "Miss Okafor", period: "After snack", room: "K-2" },
  shapes: { teacher: "Mr. Delgado", period: "Art time", room: "Studio" },
  weather: { teacher: "Miss Okafor", period: "Afternoon", room: "K-2" },
};

const EMMA_SUBJECTS: Subject[] = [
  {
    id: "sub_letters_k",
    slug: "letters-k",
    name: "Letters and Sounds",
    icon: "translate",
    blurb: "Letters, the sounds they make, and sliding those sounds into words.",
  },
  {
    id: "sub_counting_k",
    slug: "counting-k",
    name: "Counting to 20",
    icon: "sigma",
    blurb: "Counting things, saying the numbers in order, and knowing which pile is bigger.",
  },
  {
    id: "sub_shapes_k",
    slug: "shapes-k",
    name: "Shapes and Colors",
    icon: "palette",
    blurb: "Circles, squares and triangles — and what happens when colours mix.",
  },
  {
    id: "sub_weather_k",
    slug: "weather-k",
    name: "Weather and Seasons",
    icon: "flask",
    blurb: "Rain, sun, snow, and why the year keeps going round.",
  },
];

const LIFE_KINDS = new Set(["plan", "life", "circumstance"]);

function emmaMemories(userId: string, subjectId: string): LearnerMemory[] {
  const base = {
    userId,
    sourceChatId: null,
    retiredAt: null,
  };

  const rows: Array<Partial<LearnerMemory> & { kind: LearnerMemory["kind"]; content: string }> = [
    {
      kind: "strength",
      content:
        "Hears rhymes almost instantly. She was finishing my rhyming pairs before I got to the second word.",
      confidence: 0.9,
      reinforcedCount: 4,
    },
    {
      kind: "struggle",
      content:
        "b and d swap round when she reads them. It isn't a seeing problem — she says the right sound if you ask her to trace the letter with her finger first.",
      confidence: 0.85,
      reinforcedCount: 3,
    },
    {
      kind: "preference",
      content:
        "She wants to say the sound out loud herself before I say it. If I go first she goes quiet and waits.",
      confidence: 0.88,
      reinforcedCount: 3,
    },
    {
      kind: "struggle",
      content:
        "About three minutes is her limit before she needs to move. Stopping early and coming back works far better than pushing on.",
      confidence: 0.8,
      reinforcedCount: 3,
    },
    {
      kind: "analogy",
      content:
        "Calling /sss/ 'the snake sound' made letter sounds stick. She does the hand wiggle for it on her own now.",
      concept: "letter sounds",
      confidence: 0.9,
      reinforcedCount: 3,
    },
    {
      kind: "analogy",
      content:
        "Blending clicked when we called it 'sliding' and stretched the word like a rubber band. Gaps between the sounds are what lose her.",
      concept: "blending sounds",
      confidence: 0.82,
      reinforcedCount: 2,
    },
    {
      kind: "misconception",
      content:
        "Thought a letter's name was the sound it makes — said C says 'see'. Sorted for C and M. Worth checking the others.",
      concept: "letter names and sounds",
      confidence: 0.7,
      reinforcedCount: 1,
    },
    {
      kind: "interest",
      content: "Has a cat called Pickle. Pickle turns up in roughly half her answers.",
      confidence: 0.95,
      reinforcedCount: 6,
    },
    {
      kind: "interest",
      content:
        "Dinosaurs, especially the long-necked one. She knows it is a brachiosaurus and will correct you.",
      confidence: 0.88,
      reinforcedCount: 3,
    },
    {
      kind: "interest",
      content: "Loves the swings, and counts out loud while she's on them.",
      confidence: 0.75,
      reinforcedCount: 2,
    },
    {
      kind: "life",
      content: "Lost her first tooth. She has told me about it three times.",
      confidence: 0.9,
      reinforcedCount: 3,
      horizon: "episodic" as const,
      expiresAt: inDays(45),
      createdAt: daysAgo(13),
      updatedAt: daysAgo(3),
    },
    {
      kind: "plan",
      content:
        "Said on Friday she was taking a photo of Pickle in for show and tell on Monday.",
      confidence: 0.9,
      reinforcedCount: 0,
      horizon: "episodic" as const,
      followUpAt: daysAgo(1),
      followedUpAt: null,
      expiresAt: inDays(14),
      createdAt: daysAgo(4),
      updatedAt: daysAgo(4),
    },
    {
      kind: "circumstance",
      content:
        "She sees a speech therapist at school on Tuesdays for the /r/ sound. Don't ask her to repeat r-words back. Accept the try, say what was right, move on.",
      confidence: 0.95,
      reinforcedCount: 1,
      horizon: "enduring" as const,
      sensitive: true,
      createdAt: daysAgo(26),
      updatedAt: daysAgo(26),
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
    createdAt: daysAgo(22 - index),
    updatedAt: daysAgo(Math.max(1, 12 - index)),
    ...base,
    ...row,
  })) as LearnerMemory[];
}

export interface EmmaSeedResult {
  login: { username: string; email: string; password: string };
  userId: string;
  subjects: number;
  syllabusId: string;
  completedLesson: string;
  currentLesson: string;
  memories: number;
}

export async function seedEmmaLearner(): Promise<EmmaSeedResult> {
  await clearLearner({ email: EMMA_EMAIL, userId: EMMA_USER_ID });

  const catalog = await db.subjects.all();
  const known = new Set(catalog.map((subject) => subject.id));
  const missing = EMMA_SUBJECTS.filter((subject) => !known.has(subject.id));
  if (missing.length) await db.subjects.insertMany(missing);

  const user: User = {
    id: EMMA_USER_ID,
    email: EMMA_EMAIL,
    passwordHash: await hashPassword(EMMA_PASSWORD),
    provider: "password",
    emailVerified: true,
    createdAt: daysAgo(35),
    updatedAt: now(),
  };
  await db.users.insert(user);

  const profile: Profile & { id: string } = {
    id: user.id,
    userId: user.id,
    name: "Emma",
    pronouns: "she/her",
    birthYear: new Date().getFullYear() - 5,
    avatarUrl: null,
    locale: "en",
    theme: "light",
    onboardedAt: daysAgo(35),
  };
  await db.profiles.insert(profile);

  const lettersSubject = EMMA_SUBJECTS[0];
  const pack = getPack(lettersSubject.slug, lettersSubject.name);

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
    subjectId: lettersSubject.id,
    level: "beginner",
    title: pack.title,
    status: "ready",
    error: null,
    chapters,
    glossary: pack.glossary ?? [],
    timeline: pack.timeline ?? [],
    createdAt: daysAgo(34),
    updatedAt: daysAgo(34),
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
      subjectId: lettersSubject.id,
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
      subjectId: lettersSubject.id,
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

  const lessonOne = await buildLesson(0, 13);
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
    completedAt: daysAgo(11),
    updatedAt: daysAgo(11),
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
    subjectId: lettersSubject.id,
    startedAt: daysAgo(11),
    submittedAt: daysAgo(11),
    answers,
    correctCount,
    totalQuestions: lessonOne.quiz.questions.length,
    score,
    maxScore,
    durationSeconds: 352,
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

  const countingSyllabusId = await seedSideCourse({
    userId: user.id,
    subject: EMMA_SUBJECTS[1],
    startedDaysAgo: 21,
    chapters: [
      {
        title: "Counting to Ten",
        summary: "One to ten, pointing at each thing as you say it.",
        completedDaysAgo: 20,
        attempts: [
          { daysAgo: 20, passed: true },
          { daysAgo: 12, passed: true },
        ],
      },
      {
        title: "Ten to Twenty",
        summary: "The teen numbers, which do not sound the way you expect.",
        completedDaysAgo: 16,
        attempts: [
          { daysAgo: 16, passed: false },
          { daysAgo: 15, passed: true },
        ],
      },
      {
        title: "Which Pile Has More",
        summary: "Comparing two groups without counting them one by one.",
        completedDaysAgo: 3,
        attempts: [{ daysAgo: 3, passed: true }],
      },
      {
        title: "Writing the Numbers",
        summary: "Making the number shapes with a pencil.",
        completedDaysAgo: null,
        attempts: [],
      },
    ],
  });

  const shapesSyllabusId = await seedSideCourse({
    userId: user.id,
    subject: EMMA_SUBJECTS[2],
    startedDaysAgo: 34,
    chapters: [
      {
        title: "Circles, Squares and Triangles",
        summary: "Three shapes, and how to tell them apart by their corners.",
        completedDaysAgo: 33,
        attempts: [
          { daysAgo: 33, passed: true },
          { daysAgo: 2, passed: true },
        ],
      },
      {
        title: "Colours and Mixing",
        summary: "Red and yellow make orange. Blue and yellow make green.",
        completedDaysAgo: 25,
        attempts: [{ daysAgo: 25, passed: true }],
      },
      {
        title: "Patterns",
        summary: "Red, blue, red, blue — and guessing what comes next.",
        completedDaysAgo: 18,
        attempts: [{ daysAgo: 18, passed: true }],
      },
    ],
  });

  const revisionQuizzes = await db.quizzes.find(
    (row) => row.userId === user.id && row.subjectId === EMMA_SUBJECTS[2].id,
  );
  const REVISION_DAYS = [32, 31, 26, 24, 19, 17, 14, 13];

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
      durationSeconds: 180,
      passed: true,
    });
  }

  const enrollments: Enrollment[] = [
    {
      id: newId("enr"),
      userId: user.id,
      subjectId: lettersSubject.id,
      addedAt: daysAgo(35),
      placementStatus: "completed",
      placementScore: 40,
      level: "beginner",
      syllabusId: syllabus.id,
    },
    {
      id: newId("enr"),
      userId: user.id,
      subjectId: EMMA_SUBJECTS[2].id,
      addedAt: daysAgo(34),
      placementStatus: "completed",
      placementScore: 60,
      level: "beginner",
      syllabusId: shapesSyllabusId,
    },
    {
      id: newId("enr"),
      userId: user.id,
      subjectId: EMMA_SUBJECTS[1].id,
      addedAt: daysAgo(22),
      placementStatus: "completed",
      placementScore: 55,
      level: "beginner",
      syllabusId: countingSyllabusId,
    },
    {
      id: newId("enr"),
      userId: user.id,
      subjectId: EMMA_SUBJECTS[3].id,
      addedAt: daysAgo(6),
      placementStatus: "pending",
      placementScore: null,
      level: null,
      syllabusId: null,
    },
  ];
  await db.enrollments.insertMany(enrollments);

  const companion: CompanionState = {
    id: newId("cmp"),
    userId: user.id,
    equipped: {
      badge: "rw_habit_secondlook",
      aura: "rw_habit_prism",
    },
    room: {
      backdrop: "rw_shp_rainbow",
      floor: "rw_room_chair",
      shelf: "rw_let_blocks",
      wall: "rw_cnt_line",
      pet: "rw_room_rabbit",
    },
    seenRewardIds: [
      "rw_let_blocks",
      "rw_cnt_bears",
      "rw_cnt_line",
      "rw_shp_sorter",
      "rw_shp_paints",
      "rw_shp_rainbow",
      "rw_habit_secondlook",
      "rw_habit_return",
      "rw_habit_thorough",
      "rw_habit_weeks",
      "rw_habit_radiant",
      "rw_habit_prism",
      "rw_room_chair",
      "rw_room_dawn",
      "rw_room_rabbit",
    ],
    nickname: "Pip",
    updatedAt: daysAgo(2),
  };
  await db.companionStates.insert(companion);

  const memories = emmaMemories(user.id, lettersSubject.id);
  await db.learnerMemories.insertMany(memories);

  return {
    login: { username: "emma", email: EMMA_EMAIL, password: EMMA_PASSWORD },
    userId: user.id,
    subjects: EMMA_SUBJECTS.length,
    syllabusId: syllabus.id,
    completedLesson: lessonOne.lesson.title,
    currentLesson: lessonTwo.lesson.title,
    memories: memories.length,
  };
}
