export type ExerciseType = 'multiple-choice' | 'fill-blank' | 'translation';

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
  isA1: boolean;
  isBeyondA1: boolean;
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
}
