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

// Page bodies are markdown text; the array is a validation-time payload
// only — createContent/updateContent strip it out to files on disk and
// never persist it into body_json (see server/src/lib/contentFiles.ts).
const readingBodySchema = z.object({
  kind: z.literal('reading'),
  pages: z.array(z.string().trim().min(1).max(20_000)).min(1).max(50),
  xpReward: z.number().int().nonnegative().default(10),
  // Whether finishing this counts toward XP/grades, or is just tracked as
  // read. A teacher chooses this per lesson.
  gradable: z.boolean().default(true),
});

const delfLevel = z.enum(['a1', 'a2', 'b1', 'b2']);

const listeningQuestionSchema = z
  .object({
    type: z.enum(['multiple-choice', 'short']),
    prompt: z.string().trim().min(1).max(500),
    options: z.array(z.string().trim().min(1).max(300)).min(2).max(6).optional(),
    answer: z.string().trim().min(1).max(300),
    explanation: z.string().trim().max(1000).optional(),
  })
  .refine((q) => q.type !== 'multiple-choice' || (q.options?.includes(q.answer) ?? false), {
    message: 'A multiple-choice answer must be one of its options',
  });

// The script is read aloud by the student's browser (speech synthesis), so
// only text is stored — no audio files to host.
const listeningBodySchema = z.object({
  kind: z.literal('listening'),
  level: delfLevel.optional(),
  situation: z.string().trim().max(500).default(''),
  // How many times the recording can be played; the DELF plays most documents twice.
  plays: z.number().int().min(1).max(3).default(2),
  script: z
    .array(z.object({ speaker: z.string().trim().max(60).optional(), text: z.string().trim().min(1).max(3000) }))
    .min(1)
    .max(60),
  questions: z.array(listeningQuestionSchema).min(1).max(40),
  xpReward: z.number().int().nonnegative().default(10),
});

// Free writing marked by the teacher against the DELF grid for `level`.
const writingBodySchema = z.object({
  kind: z.literal('writing'),
  level: delfLevel,
  consigne: z.string().trim().min(1).max(3000),
  minWords: z.number().int().min(1).max(2000),
  timeMinutes: z.number().int().min(1).max(240).optional(),
  checklist: z.array(z.string().trim().min(1).max(300)).max(20).default([]),
  // Shown to a student only after they have submitted.
  modelAnswer: z.string().trim().max(20_000).optional(),
  xpReward: z.number().int().nonnegative().default(10),
});

export const contentBodySchema = z.discriminatedUnion('kind', [
  lessonBodySchema,
  quizBodySchema,
  readingBodySchema,
  listeningBodySchema,
  writingBodySchema,
]);
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

// Only the answers themselves are accepted from the client. Correctness,
// score and XP are all worked out server-side in lib/grading.ts, so anything
// else an older client still sends (correct, score, xpEarned) is stripped.
export const submitAttemptSchema = z.object({
  responses: z
    .array(
      z.object({
        index: z.number().int().nonnegative(),
        answerGiven: z.string().max(2000).optional(),
      })
    )
    .max(500),
  // Writing assignments only: the student's full text.
  text: z.string().max(20_000).optional(),
});

const band = z.number().int().min(0).max(3);

export const reviewAttemptSchema = z.object({
  bands: z.object({ task: band, coherence: band, sociolinguistic: band, lexicon: band, morphosyntax: band }),
  feedback: z.string().trim().max(5000).optional().default(''),
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

export const regenerateRecoveryCodeSchema = z.object({
  currentPassword: z.string().min(1),
});

export const resetStudentPasswordSchema = z.object({
  newPassword: password,
});

export const createFlagSchema = z.object({
  questionIndex: z.number().int().nonnegative(),
  reason: z.string().trim().max(500).optional().default(''),
});
