import type { Interactive, Level } from "@/lib/db/types";

export interface PackReading {
  title: string;
  attribution: string;
  body: string[];
  guidingQuestions: string[];
}

export interface PackSlide {
  heading: string;
  body: string[];
  image?: { url: string; caption: string };
  reading?: PackReading;
  interactive?: Omit<Interactive, "id">;
}

export interface PackQuestion {
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  difficulty: Level;
}

export interface PackMisconception {
  belief: string;
  correction: string;
}

export interface PackChapter {
  title: string;
  summary: string;
  objectives: string[];
  misconceptions?: PackMisconception[];
  minLevel: Level;
  slides: PackSlide[];
  quiz: PackQuestion[];
}

export interface PackGlossaryTerm {
  term: string;
  definition: string;
}

export interface PackTimelineEntry {
  year: string;
  event: string;
  why: string;
}

export interface CoursePack {
  subjectSlug: string;
  title: string;
  chapters: PackChapter[];
  placement: PackQuestion[];
  glossary?: PackGlossaryTerm[];
  timeline?: PackTimelineEntry[];
  finalExam?: PackQuestion[];
}
