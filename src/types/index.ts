export type ExerciseType = 'multiple-choice' | 'fill-blank' | 'translation';

export interface SRSCard {
  interval: number;
  ease: number;
  nextReview: string; // YYYY-MM-DD
  reps: number;
  /** Times a remembered card was forgotten again. Absent on cards saved before this was tracked. */
  lapses?: number;
  /** Date the card first entered review; absent on cards saved before this was tracked. */
  introduced?: string;
}

export interface VocabItem {
  french: string;
  english: string;
  pronunciation: string;
  example?: string;
  exampleTranslation?: string;
  funnyNote?: string;
}

export interface Exercise {
  type: ExerciseType;
  prompt: string;
  answer: string;
  options?: string[];
  hint?: string;
}

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  vocab: VocabItem[];
  exercises: Exercise[];
  xpReward: number;
}

export interface Unit {
  id: string;
  slug: string;
  title: string;
  emoji: string;
  tagline: string;
  funnyDescription: string;
  color: string;
  accentColor: string;
  lessons: Lesson[];
  isPreA1?: boolean;
  isA1: boolean;
  isA1A2?: boolean;
  isBeyondA1: boolean;
  isBridge?: boolean;
  isB1?: boolean;
  isB2?: boolean;
}

export interface ConversationTurn {
  id: string;
  npcFrench: string;
  npcEnglish: string;
  playerHint: string;
  correctResponse: string;
  options: string[]; // index 0 is always the correct answer
  acceptedKeywords: string[];
  missionComplete?: boolean;
}

export interface Scenario {
  id: string;
  title: string;
  emoji: string;
  setting: string;
  mission: string;
  npcName: string;
  npcRole: string;
  recommendedDifficulty: 1 | 2 | 3;
  turns: ConversationTurn[];
}

export type Difficulty = 1 | 2 | 3;

export type CEFRBand = 'pre-a1' | 'a1' | 'a2' | 'b1' | 'b2';

export interface TestItem {
  id: string;
  type: ExerciseType;
  a: number;
  b: number;
  /** Pseudo-guessing floor (3PL "c" parameter) — 0 for constructed-response
   * types, ~1/numOptions for multiple-choice. Computed once in testItemBank.ts. */
  c?: number;
  topic: string;
  cefr: CEFRBand;
  source: 'lesson' | 'authored';
  sourceRef?: { lessonId: string; exerciseIndex: number };
  prompt?: string;
  answer?: string;
  options?: string[];
  hint?: string;
}

export interface TestResponseLog {
  itemId: string;
  topic: string;
  correct: boolean;
  thetaAtTime: number;
  a: number;
  b: number;
  c?: number;
}

export interface TestResult {
  id: string;
  date: string;
  theta: number;
  se: number;
  cefrLevel: string;
  cefrBand: 'lower' | 'mid' | 'upper' | null;
  itemsAdministered: number;
  correctCount: number;
  topicBreakdown: Record<string, { correct: number; total: number }>;
  responses: TestResponseLog[];
}

export interface ProgressState {
  completedLessons: string[];
  xp: number;
  streak: number;
  lastStudiedDate: string;
  earnedBadges: string[];
  darkMode: boolean;
  unit12Mode: 'full-freedom' | 'earned-reward' | null;
  onboardingDone: boolean;
  accentColor: string;
  appleMode: boolean;
  reducedGpu: boolean;
  bookmarkedLessons: string[];
  srsData: Record<string, SRSCard>;
}

export type LearnerGoal = 'trip' | 'moving' | 'exam' | 'fun';

export type PriorLevel = 'none' | 'some' | 'placed';

export interface LearnerProfile {
  goals: LearnerGoal[];
  /** YYYY-MM-DD the learner needs French by (a trip, a move, an exam), or null. */
  targetDate: string | null;
  priorLevel: PriorLevel;
}

export type LessonSkill =
  | 'pronunciation'
  | 'vocabulary'
  | 'grammar'
  | 'numbers'
  | 'listening'
  | 'speaking'
  | 'culture'
  | 'reading';

export type GoalWeight = 0 | 1 | 2 | 3;

export interface LessonMeta {
  cefr: CEFRBand;
  skills: LessonSkill[];
  /** Lesson ids that should be done first. Must not form a cycle. */
  prereqs: string[];
  /** How important this lesson is for each goal: 0 irrelevant … 3 essential. */
  goalWeight: Record<LearnerGoal, GoalWeight>;
}

export interface ExerciseStat {
  attempts: number;
  correct: number;
  lastCorrect: boolean;
}
