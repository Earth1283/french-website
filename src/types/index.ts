export type ExerciseType = 'multiple-choice' | 'fill-blank' | 'translation';

export interface SRSCard {
  interval: number;
  ease: number;
  nextReview: string; // YYYY-MM-DD
  reps: number;
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
