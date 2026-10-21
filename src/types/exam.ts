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

// ─── Production orale ───────────────────────────────────────────────────────

/**
 * The part types of the DELF tout public speaking papers:
 *   A1: entretien dirigé → échange d'informations → dialogue simulé (interaction)
 *   A2: entretien dirigé → monologue suivi → exercice en interaction
 *   B1: entretien dirigé → exercice en interaction → expression d'un point de vue
 *   B2: présentation et défense d'un point de vue (point-de-vue, then débat)
 */
export type SpeakingPartKind = 'entretien' | 'echange' | 'interaction' | 'monologue' | 'point-de-vue' | 'debat';

export interface SpeakingPart {
  kind: SpeakingPartKind;
  /** The part's name on the paper, in French ("Entretien dirigé"). */
  title: string;
  /** The instructions in French, as the candidate reads them. */
  consigne: string;
  instructionsEn: string;
  /** The stimulus: a short article (B1/B2) or a role-play card (A1–B1 interaction). */
  document?: string;
  /** A1 échange d'informations: the words the candidate builds questions from. */
  cueCards?: string[];
  /** Preparation time before this part; 0 when the part starts straight away. */
  prepMinutes: number;
  /** Roughly how long the candidate should be speaking in this part. */
  speakMinutes: number;
  /**
   * What the examiner says, in order, read aloud one at a time: questions for an
   * entretien, the other character's lines for a role-play, follow-ups for a
   * débat. Empty for a monologue the candidate delivers alone.
   */
  examinerLines: string[];
  /** What an examiner checks for in this part. */
  checklist: string[];
  usefulPhrases: string[];
  /** An at-level sample of what the candidate might say, as a transcript. */
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
  /** What the marker heard, one entry per part (AI marking only). */
  transcripts?: string[];
  /** Set when there was too little speech to assess, which scores 0 throughout. */
  tooShort?: boolean;
}

export interface SpeakingAttempt {
  id: string;
  taskId: string;
  date: string;
  /** Seconds of the candidate's own speech, per part. */
  secondsPerPart: number[];
  evaluation: SpeakingEvaluation | null;
}

// ─── Mock exam ──────────────────────────────────────────────────────────────

export interface MockSectionScore {
  /** Out of 25, as on the DELF results sheet. */
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
  /** Reading isn't in the app: entered by hand from an official sample paper, if at all. */
  reading: number | null;
  /** Which items were used, so a result can be reviewed. */
  listeningDocIds: string[];
  writingTaskIds: string[];
  speakingTaskId: string;
}
