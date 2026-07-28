import { Collection } from "./store";
import type { CourseBrief, LearnerMemory } from "@/lib/tutor/types";
import type {
  ArcadePlay,
  Attempt,
  Chat,
  CompanionState,
  Enrollment,
  Job,
  Lesson,
  Message,
  OtpCode,
  Profile,
  Progress,
  Project,
  ProjectSubmission,
  Quiz,
  Session,
  Subject,
  Syllabus,
  User,
} from "./types";

export const db = {
  users: new Collection<User>("users"),
  profiles: new Collection<Profile & { id: string }>("profiles"),
  sessions: new Collection<Session & { id: string }>("sessions"),
  otps: new Collection<OtpCode>("otps"),
  subjects: new Collection<Subject>("subjects"),
  enrollments: new Collection<Enrollment>("enrollments"),
  syllabi: new Collection<Syllabus>("syllabi"),
  lessons: new Collection<Lesson>("lessons"),
  quizzes: new Collection<Quiz>("quizzes"),
  attempts: new Collection<Attempt>("attempts"),
  progress: new Collection<Progress>("progress"),
  projects: new Collection<Project>("projects"),
  submissions: new Collection<ProjectSubmission>("submissions"),
  chats: new Collection<Chat>("chats"),
  messages: new Collection<Message>("messages"),
  jobs: new Collection<Job>("jobs"),
  learnerMemories: new Collection<LearnerMemory>("learner-memories"),
  courseBriefs: new Collection<CourseBrief>("course-briefs"),
  companionStates: new Collection<CompanionState>("companion-states"),
  arcadePlays: new Collection<ArcadePlay>("arcade-plays"),
};

export type Database = typeof db;

export * from "./types";
export { newId, now, DATA_DIR } from "./store";
