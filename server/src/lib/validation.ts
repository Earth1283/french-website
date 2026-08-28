import { z } from 'zod';

const email = z.string().trim().toLowerCase().email();
const password = z.string().min(8, 'Password must be at least 8 characters');
const name = z.string().trim().min(1).max(120);

export const teacherRegisterSchema = z.object({
  name,
  email,
  password,
  signupCode: z.string().optional(),
});

export const studentRegisterSchema = z.object({
  name,
  email,
  password,
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1),
});

export const createClassSchema = z.object({
  name: z.string().trim().min(1).max(120),
});

export const updateClassSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  archived: z.boolean().optional(),
});

const exerciseSchema = z.object({
  type: z.enum(['multiple-choice', 'fill-blank', 'translation']),
  prompt: z.string().min(1),
  answer: z.string().min(1),
  options: z.array(z.string()).optional(),
  hint: z.string().optional(),
});

const vocabItemSchema = z.object({
  french: z.string().min(1),
  english: z.string().min(1),
  pronunciation: z.string().min(1),
  example: z.string().optional(),
  exampleTranslation: z.string().optional(),
  funnyNote: z.string().optional(),
});

const lessonBodySchema = z.object({
  kind: z.literal('lesson'),
  vocab: z.array(vocabItemSchema).default([]),
  exercises: z.array(exerciseSchema).min(1),
  xpReward: z.number().int().nonnegative().default(10),
});

const quizBodySchema = z.object({
  kind: z.literal('quiz'),
  items: z.array(exerciseSchema).min(1),
  xpReward: z.number().int().nonnegative().default(10),
});

export const contentBodySchema = z.discriminatedUnion('kind', [lessonBodySchema, quizBodySchema]);
export type ContentBody = z.infer<typeof contentBodySchema>;

export const createContentSchema = z.object({
  title: z.string().trim().min(1).max(200),
  subtitle: z.string().trim().max(300).optional().default(''),
  body: contentBodySchema,
});

export const updateContentSchema = createContentSchema.partial();

export const createAssignmentSchema = z.object({
  contentId: z.string().min(1),
  dueAt: z.string().datetime().nullable().optional(),
});

export const enrollSchema = z.object({
  joinCode: z.string().trim().min(1),
});

export const submitAttemptSchema = z.object({
  responses: z.array(
    z.object({
      index: z.number().int().nonnegative(),
      correct: z.boolean(),
      answerGiven: z.string().optional(),
    })
  ),
  score: z.number().min(0).max(100),
  xpEarned: z.number().int().nonnegative(),
});

export const resetWithRecoveryCodeSchema = z.object({
  email,
  recoveryCode: z.string().trim().min(1),
  newPassword: password,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: password,
});

export const resetStudentPasswordSchema = z.object({
  newPassword: password,
});

export const createFlagSchema = z.object({
  questionIndex: z.number().int().nonnegative(),
  reason: z.string().trim().max(500).optional().default(''),
});
