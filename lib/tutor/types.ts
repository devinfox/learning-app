export type GradeBand =
  | "early" // 5–7, genuinely little
  | "elementary" // 8–10, reaching upward and allergic to being talked down to
  | "middle"
  | "high"
  | "college";

export type TutorSurface =
  | "lesson" // reading a lesson slide
  | "reading" // in a long-form reading module
  | "practice_test" // mid-quiz — must not give the answer away
  | "review" // after a quiz, going over what was missed
  | "free"; // opened from the nav with no context

export type TutorState =
  | "idle" // Idle · Star — present, waiting
  | "listening" // Trail — mic open, attentive
  | "thinking" // Orbit — request in flight
  | "speaking" // Dash — TTS playing
  | "celebrating"; // Dash sped up — milestone

export type MemoryHorizon = "episodic" | "enduring";

export type LearnerMemoryKind =
  | "analogy" // an analogy that visibly worked
  | "interest" // something they care about — a source of future analogies
  | "misconception" // a specific wrong model they hold, and the correction
  | "strength" // grasps quickly
  | "struggle" // recurring difficulty
  | "preference" // how they like to be taught
  | "plan" // something coming up for them — a trip, a match, a birthday
  | "life" // an ongoing detail — a new puppy, a house move, a best friend
  | "circumstance"; // significant and lasting — bereavement, diagnosis, care at home

export interface LearnerMemory {
  id: string;
  userId: string;
  kind: LearnerMemoryKind;
  content: string;
  concept: string | null;
  subjectId: string | null;
  confidence: number;
  reinforcedCount: number;
  sourceChatId: string | null;
  horizon: MemoryHorizon;
  expiresAt: string | null;
  followUpAt: string | null;
  followedUpAt: string | null;
  sensitive: boolean;
  createdAt: string;
  updatedAt: string;
  retiredAt: string | null;
}

export interface CourseBrief {
  id: string;
  subjectId: string;
  syllabusId: string | null;
  status: "generating" | "ready" | "failed";
  error: string | null;
  overview: string;
  bigIdeas: string[];
  throughLines: string[];
  keyTerms: Array<{ term: string; gloss: string }>;
  commonMisconceptions: Array<{ belief: string; correction: string }>;
  analogySeeds: string[];
  probeQuestions: string[];
  model: string;
  createdAt: string;
  updatedAt: string;
}

export interface CourseStanding {
  subjectId: string;
  subjectName: string;
  courseTitle: string;
  level: string | null;
  placementTaken: boolean;
  totalChapters: number;
  completedChapters: number;
  percentComplete: number;
  currentChapterTitle: string | null;
  recentlyCompleted: string[];
  upNext: string[];
  masteryCounts: Record<string, number>;
  chapters: Array<{ title: string; completed: boolean }>;
}

export interface LearnerRecord {
  courses: CourseStanding[];
  totalChaptersCompleted: number;
  sessionsThisWeek: number;
  bestWeekSessions: number;
  rewards: Array<{ name: string; reason: string }>;
}

export interface TutorContext {
  band: GradeBand;
  surface: TutorSurface;
  learnerName: string;
  subjectName: string | null;
  lessonTitle: string | null;
  visibleHeadings: string[];
  readingExcerpt: string | null;
  activeQuestion: { prompt: string; options: string[] } | null;
  brief: CourseBrief | null;
  memories: LearnerMemory[];
  standing: CourseStanding | null;
  record: LearnerRecord;
  exchangeCount: number;
  dueFollowUps: LearnerMemory[];
}
