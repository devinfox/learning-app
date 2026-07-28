import { z } from "zod";

export const emailField = z.string().trim().toLowerCase().email("Enter a valid email address.");

export const passwordField = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(200, "That password is too long.");

export const codeField = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "Enter the 6-digit code.");

export const registerSchema = z.object({
  email: emailField,
  password: passwordField,
  name: z.string().trim().max(80).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, "Enter your email or username."),
  password: z.string().min(1, "Enter your password."),
});

export const socialSchema = z.object({
  provider: z.enum(["google", "apple"]),
  email: emailField,
  name: z.string().trim().max(80).optional(),
});

export const verifyEmailSchema = z.object({ code: codeField });

export const forgotPasswordSchema = z.object({ email: emailField });

export const resetPasswordSchema = z.object({
  email: emailField,
  code: codeField,
  password: passwordField,
});

export const profilePatchSchema = z
  .object({
    name: z.string().trim().min(1, "Enter your name.").max(80).optional(),
    pronouns: z.string().trim().max(40).nullable().optional(),
    birthYear: z
      .number()
      .int()
      .min(1900, "Enter a valid year.")
      .max(new Date().getFullYear(), "Enter a valid year.")
      .nullable()
      .optional(),
    avatarUrl: z.string().trim().max(500).nullable().optional(),
    locale: z.enum(["en", "es", "fr", "de", "pt", "ar"]).optional(),
    theme: z.enum(["light", "dark", "system"]).optional(),
  })
  .refine((patch) => Object.keys(patch).length > 0, {
    message: "Nothing to update.",
  });

export const changeEmailSchema = z.object({ email: emailField });
export const confirmEmailSchema = z.object({ code: codeField });

export const changePasswordSchema = z.object({
  currentPassword: z.string().default(""),
});

export const confirmPasswordSchema = z.object({
  code: codeField,
  password: passwordField,
});

export const addSubjectSchema = z.object({ subjectId: z.string().min(1) });

export const submitAttemptSchema = z.object({
  answers: z.record(z.string(), z.number().int().min(0)),
});

export const startExamSchema = z.object({
  syllabusId: z.string().min(1),
  unit: z.union([z.number().int().min(1), z.literal("final")]),
});

export const submitProjectSchema = z.object({
  body: z
    .string()
    .trim()
    .min(40, "Write a bit more before you hand this in.")
    .max(20000),
  claimed: z.array(z.string().min(1).max(64)).max(12).default([]),
});

export const slideProgressSchema = z.object({
  slideIndex: z.number().int().min(0),
});

export const checkInteractiveSchema = z.object({
  answer: z.array(z.number().int().min(0)).min(1),
});

export const createChatSchema = z.object({
  subjectId: z.string().nullable().optional(),
  lessonId: z.string().nullable().optional(),
});

export const attachmentSchema = z.object({
  id: z.string(),
  kind: z.enum(["image", "file"]),
  name: z.string(),
  mimeType: z.string(),
  size: z.number().int().min(0),
  url: z.string(),
});

export const sendMessageSchema = z.object({
  content: z.string().trim().min(1, "Type a message.").max(8000),
  attachments: z.array(attachmentSchema).max(10).optional(),
  viaVoice: z.boolean().optional(),
  activation: z
    .object({
      surface: z.enum(["lesson", "reading", "practice_test", "review", "free"]),
      band: z.enum(["early", "elementary", "middle", "high", "college"]).optional(),
      subjectId: z.string().nullable().optional(),
      lessonId: z.string().nullable().optional(),
      slideIndex: z.number().int().min(0).nullable().optional(),
      question: z
        .object({ prompt: z.string(), options: z.array(z.string()) })
        .nullable()
        .optional(),
    })
    .optional(),
});

export const dashboardQuerySchema = z.object({
  subjectId: z.string().optional(),
});

export const subjectQuerySchema = z.object({
  q: z.string().optional(),
});

export const activationSchema = z.object({
  surface: z.enum(["lesson", "reading", "practice_test", "review", "free"]),
  band: z.enum(["early", "elementary", "middle", "high", "college"]).optional(),
  subjectId: z.string().nullable().optional(),
  lessonId: z.string().nullable().optional(),
  slideIndex: z.number().int().min(0).nullable().optional(),
  question: z
    .object({ prompt: z.string(), options: z.array(z.string()) })
    .nullable()
    .optional(),
});

export const briefRequestSchema = z.object({
  subjectId: z.string().min(1),
  syllabusId: z.string().nullable().optional(),
});

export const briefQuerySchema = z.object({
  subjectId: z.string().min(1),
  syllabusId: z.string().optional(),
});

export const speakSchema = z.object({
  text: z.string().trim().min(1).max(5000),
  band: z.enum(["early", "elementary", "middle", "high", "college"]).optional(),
  voiceId: z.string().optional(),
});

export const equipSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("equip"),
    slot: z.string().min(1).max(24),
    rewardId: z.string().min(1).max(64).nullable(),
  }),
  z.object({
    kind: z.literal("seen"),
    rewardIds: z.array(z.string().min(1).max(64)).max(80),
  }),
  z.object({
    kind: z.literal("nickname"),
    nickname: z.string().max(24),
  }),
]);
