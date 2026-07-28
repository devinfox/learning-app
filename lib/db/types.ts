export type Locale = "en" | "es" | "fr" | "de" | "pt" | "ar";
export type Theme = "light" | "dark" | "system";

export type AuthProvider = "password" | "google" | "apple";

export interface User {
  id: string;
  email: string;
  passwordHash: string | null;
  provider: AuthProvider;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  userId: string;
  name: string;
  pronouns: string | null;
  birthYear: number | null;
  avatarUrl: string | null;
  locale: Locale;
  theme: Theme;
  onboardedAt: string | null;
}

export interface Session {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

export type OtpPurpose =
  | "verify_email"
  | "reset_password"
  | "change_email"
  | "change_password";

export interface OtpCode {
  id: string;
  userId: string;
  email: string;
  purpose: OtpPurpose;
  codeHash: string;
  expiresAt: string;
  resendableAt: string;
  attempts: number;
  consumedAt: string | null;
  createdAt: string;
  payload: Record<string, string> | null;
}

export interface Subject {
  id: string;
  slug: string;
  name: string;
  icon: string;
  blurb: string;
}

export type PlacementStatus = "pending" | "in_progress" | "skipped" | "completed";
export type Level = "beginner" | "intermediate" | "advanced";

export interface Enrollment {
  id: string;
  userId: string;
  subjectId: string;
  addedAt: string;
  placementStatus: PlacementStatus;
  placementScore: number | null;
  level: Level | null;
  syllabusId: string | null;
}

export type GenerationStatus = "pending" | "generating" | "ready" | "failed";

export interface Chapter {
  id: string;
  order: number;
  title: string;
  summary: string;
  objectives: string[];
  misconceptions: Array<{ belief: string; correction: string }>;
  lessonId: string | null;
  lessonStatus: GenerationStatus;
}

export interface Syllabus {
  id: string;
  userId: string;
  subjectId: string;
  level: Level;
  title: string;
  status: GenerationStatus;
  error: string | null;
  chapters: Chapter[];
  glossary: Array<{ term: string; definition: string }>;
  timeline: Array<{ year: string; event: string; why: string }>;
  createdAt: string;
  updatedAt: string;
}

export type InteractiveKind = "mcq" | "true_false" | "drag_drop";

export interface Interactive {
  id: string;
  kind: InteractiveKind;
  prompt: string;
  options: string[];
  answer: number[];
  explanation: string;
}

export interface Reading {
  title: string;
  attribution: string;
  body: string[];
  guidingQuestions: string[];
}

export interface Slide {
  id: string;
  order: number;
  heading: string;
  body: string[];
  image: { url: string; caption: string } | null;
  reading: Reading | null;
  interactive: Interactive | null;
}

export interface Lesson {
  id: string;
  syllabusId: string;
  chapterId: string;
  userId: string;
  subjectId: string;
  title: string;
  status: GenerationStatus;
  error: string | null;
  slides: Slide[];
  quizId: string | null;
  createdAt: string;
  updatedAt: string;
}

export type QuizKind = "placement" | "lesson" | "exam" | "final";

export interface Question {
  id: string;
  order: number;
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  points: number;
}

export interface Quiz {
  id: string;
  kind: QuizKind;
  userId: string;
  subjectId: string;
  lessonId: string | null;
  title: string;
  status: GenerationStatus;
  error: string | null;
  questions: Question[];
  createdAt: string;
}

export interface Attempt {
  id: string;
  userId: string;
  quizId: string;
  kind: QuizKind;
  subjectId: string;
  startedAt: string;
  submittedAt: string | null;
  answers: Record<string, number>;
  correctCount: number;
  totalQuestions: number;
  score: number;
  maxScore: number;
  durationSeconds: number;
  passed: boolean;
}

export interface Progress {
  id: string;
  userId: string;
  syllabusId: string;
  chapterId: string;
  lessonId: string;
  slideIndex: number;
  slideCount: number;
  attemptedInteractiveIds: string[];
  completed: boolean;
  completedAt: string | null;
  updatedAt: string;
}

export interface RubricCriterion {
  id: string;
  title: string;
  description: string;
  points: number;
  levels: string[];
}

export interface Project {
  id: string;
  slug: string;
  userId: string;
  subjectId: string;
  syllabusId: string | null;
  title: string;
  blurb: string;
  prompt: string;
  steps: string[];
  rubric: RubricCriterion[];
  chaptersRequired: number;
  createdAt: string;
}

export type SubmissionStatus = "grading" | "scored" | "failed";

export interface CriterionScore {
  criterionId: string;
  level: number;
  points: number;
  note: string;
}

export interface ProjectSubmission {
  id: string;
  projectId: string;
  userId: string;
  subjectId: string;
  body: string;
  claimed: string[];
  status: SubmissionStatus;
  scores: CriterionScore[];
  score: number;
  maxScore: number;
  feedback: string;
  gradedAt: string | null;
  gradedBy: "ai" | "teacher" | "checklist" | null;
  error: string | null;
  submittedAt: string;
}

export interface CompanionState {
  id: string;
  userId: string;
  equipped: Record<string, string>;
  room: Record<string, string>;
  seenRewardIds: string[];
  nickname: string | null;
  updatedAt: string;
}

export interface Chat {
  id: string;
  userId: string;
  title: string;
  subjectId: string | null;
  lessonId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  kind: "image" | "file";
  name: string;
  mimeType: string;
  size: number;
  url: string;
}

export interface Message {
  id: string;
  chatId: string;
  role: "user" | "assistant";
  content: string;
  attachments: Attachment[];
  viaVoice: boolean;
  createdAt: string;
}

export type JobType =
  | "generate_syllabus"
  | "generate_lesson"
  | "generate_placement_quiz"
  | "grade_project"
  | "analyze_course";
export type JobStatus = "queued" | "running" | "succeeded" | "failed";

export interface Job {
  id: string;
  type: JobType;
  status: JobStatus;
  payload: Record<string, string>;
  error: string | null;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
}

export type { CourseBrief, GradeBand, LearnerMemory, LearnerMemoryKind } from "@/lib/tutor/types";
