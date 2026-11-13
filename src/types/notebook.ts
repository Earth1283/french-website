import type { Exercise } from './index';

export type MistakeSource = 'lesson' | 'conversation' | 'writing' | 'reading';

export interface MistakeInput {
  /** Stable across repeat attempts, so the same exercise stays in one entry. */
  id: string;
  source: MistakeSource;
  sourceTitle: string;
  sourceHref: string;
  prompt: string;
  original: string;
  corrected: string;
  explanation: string;
  exercise: Exercise;
  context?: string;
}

export interface Mistake extends MistakeInput {
  firstSeen: string;
  lastSeen: string;
  occurrences: number;
  resolved: boolean;
  inReview: boolean;
  practiceAttempts: number;
  practiceCorrect: number;
}
