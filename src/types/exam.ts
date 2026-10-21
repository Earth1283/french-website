// DELF-style exam practice: listening comprehension (compréhension de l'oral)
// and written production (production écrite). The content is original, written
// to the task formats of the current DELF tout public papers.

export type DelfLevel = 'a1' | 'a2' | 'b1' | 'b2';

export interface ListeningLine {
  /** Omit for a single-voice document (announcement, voicemail, radio segment). */
  speaker?: string;
  text: string;
}

export interface ListeningQuestion {
  /** DELF uses three-option MCQs; `short` is a typed answer (a time, a price, a name). */
  type: 'multiple-choice' | 'short';
  prompt: string;
  options?: string[];
  answer: string;
  /** English note pointing at the part of the transcript that gives the answer. */
  explanation?: string;
}

export interface ListeningDoc {
  id: string;
  level: DelfLevel;
  title: string;
  genre: 'annonce' | 'message' | 'dialogue' | 'radio' | 'interview';
  /** The situation line read before the audio, in French, as on the paper. */
  situation: string;
  /** How many times the recording is heard in exam mode. */
  plays: 1 | 2;
  script: ListeningLine[];
  questions: ListeningQuestion[];
}

export interface WritingTask {
  id: string;
  level: DelfLevel;
  title: string;
  genre: string;
  /** The task wording in French, as a candidate would see it. */
  consigne: string;
  instructionsEn: string;
  minWords: number;
  timeMinutes: number;
  /** What an examiner checks for under "réalisation de la tâche". */
  checklist: string[];
  usefulPhrases: string[];
  modelAnswer: string;
}

export type RubricCriterionId = 'task' | 'coherence' | 'sociolinguistic' | 'lexicon' | 'morphosyntax';

/** 0 = not answered/insufficient, 1 = below level, 2 = at level, 3 = above (A2+, B1+…). */
export type RubricBand = 0 | 1 | 2 | 3;

export interface WritingCorrection {
  original: string;
  corrected: string;
  explanation: string;
}

export interface WritingEvaluation {
  source: 'ai' | 'self' | 'teacher';
  bands: Record<RubricCriterionId, RubricBand>;
  comments: Partial<Record<RubricCriterionId, string>>;
  score: number;
  maxScore: number;
  summary?: string;
  corrections?: WritingCorrection[];
  /** Set when the text was under half the required length, which scores 0 on the real grid. */
  tooShort?: boolean;
}

export interface ListeningResult {
  id: string;
  docId: string;
  date: string;
  mode: 'exam' | 'practice';
  correct: number;
  total: number;
}

export interface WritingSubmission {
  id: string;
  taskId: string;
  date: string;
  text: string;
  wordCount: number;
  secondsSpent: number;
  evaluation: WritingEvaluation | null;
}

export type SpeakingPartKind = 'entretien' | 'echange' | 'interaction' | 'monologue' | 'point-de-vue' | 'debat';

export interface SpeakingPart {
  kind: SpeakingPartKind;
  title: string;
  consigne: string;
  instructionsEn: string;
  /** A B1/B2 article, or a role-play card. */
  document?: string;
  /** A1 échange d'informations only. */
  cueCards?: string[];
  prepMinutes: number;
  speakMinutes: number;
  /** Read aloud one at a time; empty when the candidate speaks alone. */
  examinerLines: string[];
  checklist: string[];
  usefulPhrases: string[];
  modelAnswer: string;
}

export interface SpeakingTask {
  id: string;
  level: DelfLevel;
  title: string;
  parts: SpeakingPart[];
}

export type SpeakingCriterionId = 'task' | 'interaction' | 'lexicon' | 'morphosyntax' | 'phonology';

export interface SpeakingEvaluation {
  source: 'ai' | 'self';
  bands: Record<SpeakingCriterionId, RubricBand>;
  comments: Partial<Record<SpeakingCriterionId, string>>;
  score: number;
  maxScore: number;
  summary?: string;
  corrections?: WritingCorrection[];
  /** AI marking only, one per part. */
  transcripts?: string[];
  tooShort?: boolean;
}

export interface SpeakingAttempt {
  id: string;
  taskId: string;
  date: string;
  secondsPerPart: number[];
  evaluation: SpeakingEvaluation | null;
}

export interface MockSectionScore {
  /** Out of 25. */
  score: number;
  source: 'auto' | 'ai' | 'self';
}

export interface MockExamResult {
  id: string;
  level: DelfLevel;
  date: string;
  listening: MockSectionScore;
  writing: MockSectionScore;
  speaking: MockSectionScore;
  /** Reading isn't in the app; the learner may enter a score from an official sample paper. */
  reading: number | null;
  listeningDocIds: string[];
  writingTaskIds: string[];
  speakingTaskId: string;
}
