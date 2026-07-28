import { z } from "zod";

export const interactiveSchema = z.object({
  kind: z.enum(["mcq", "true_false", "drag_drop"]),
  prompt: z.string(),
  options: z.array(z.string()),
  answer: z.array(z.number()),
  explanation: z.string(),
});

export const slideSchema = z.object({
  heading: z.string(),
  body: z.array(z.string()),
  interactive: interactiveSchema.nullable(),
});

export const questionSchema = z.object({
  prompt: z.string(),
  options: z.array(z.string()),
  answerIndex: z.number(),
  explanation: z.string(),
});

export const syllabusSchema = z.object({
  title: z.string(),
  chapters: z.array(
    z.object({
      title: z.string(),
      summary: z.string(),
      objectives: z.array(z.string()),
    }),
  ),
});

export const lessonSchema = z.object({
  title: z.string(),
  slides: z.array(slideSchema),
  quiz: z.array(questionSchema),
});

export const quizSchema = z.object({
  title: z.string(),
  questions: z.array(questionSchema),
});

export type GeneratedSyllabus = z.infer<typeof syllabusSchema>;
export type GeneratedLesson = z.infer<typeof lessonSchema>;
export type GeneratedQuiz = z.infer<typeof quizSchema>;
export type GeneratedSlide = z.infer<typeof slideSchema>;
export type GeneratedQuestion = z.infer<typeof questionSchema>;
