import type { QuestionFormat } from "../types";

export type HintDirective =
  | { kind: "eliminate"; optionIndex: number }
  | { kind: "decompose"; a: number; b: number; split: [number, number] }
  | { kind: "highlightArray"; rows: number; cols: number; splitAfterRow: number };

export interface HintStep {
  text: string;
  directive: HintDirective | null;
}

export interface ArrayDiagram {
  kind: "array";
  rows: number;
  cols: number;
}

export type DiagramSpec = ArrayDiagram;

export interface GeneratedQuestion {
  id: string;
  skillId: string;
  format: QuestionFormat;
  band: number;
  prompt: string;
  diagram: DiagramSpec | null;
  options: string[];
  correctIndex: number;
  hints: HintStep[];
  explanation: string;
}

export type SanitizedQuestion = Omit<
  GeneratedQuestion,
  "correctIndex" | "hints" | "explanation"
> & {
  hintCount: number;
};

export function sanitize(question: GeneratedQuestion): SanitizedQuestion {
  const { correctIndex, hints, explanation, ...rest } = question;
  void correctIndex;
  void explanation;
  return { ...rest, hintCount: hints.length };
}
