import type { CEFRBand, Exercise, ExerciseType, VocabItem } from './index';
import type { DelfLevel, ListeningLine, ListeningQuestion, RubricBand, RubricCriterionId } from './exam';

export interface ClassroomLessonBody {
  kind: 'lesson';
  vocab: VocabItem[];
  exercises: Exercise[];
  xpReward: number;
}

export interface ClassroomQuizItem {
  type: ExerciseType;
  prompt: string;
  answer: string;
  options?: string[];
  hint?: string;
  topic?: string;
  cefr?: CEFRBand;
}

export interface ClassroomQuizBody {
  kind: 'quiz';
  items: ClassroomQuizItem[];
  xpReward: number;
}

export interface ClassroomReadingBody {
  kind: 'reading';
  /** Raw markdown per page — first line "# Title" is the page title. */
  pages: string[];
  xpReward: number;
  /** Whether finishing this counts toward XP/grades, or is just tracked as read. */
  gradable: boolean;
}

export interface ClassroomListeningBody {
  kind: 'listening';
  level?: DelfLevel;
  situation: string;
  /** Plays allowed before answering. */
  plays: number;
  script: ListeningLine[];
  questions: ListeningQuestion[];
  xpReward: number;
}

export interface ClassroomWritingBody {
  kind: 'writing';
  level: DelfLevel;
  consigne: string;
  minWords: number;
  timeMinutes?: number;
  checklist: string[];
  /** Withheld from students until they have submitted. */
  modelAnswer?: string;
  xpReward: number;
}

export type ClassroomContentBody =
  | ClassroomLessonBody
  | ClassroomQuizBody
  | ClassroomReadingBody
  | ClassroomListeningBody
  | ClassroomWritingBody;

export type ClassroomContentKind = ClassroomContentBody['kind'];

export interface WritingReview {
  bands: Record<RubricCriterionId, RubricBand>;
  feedback: string;
}

export interface WritingSubmissionInfo {
  attemptId: string;
  studentId: string;
  studentName: string;
  text: string;
  wordCount: number;
  submittedAt: string;
  reviewedAt: string | null;
  score: number | null;
  review: WritingReview | null;
}

export interface ClassroomContent {
  id: string;
  teacher_id: string;
  kind: ClassroomContentKind;
  title: string;
  subtitle: string;
  body_json?: string;
  body?: ClassroomContentBody;
  created_at: string;
  updated_at: string;
}

export interface ClassInfo {
  id: string;
  teacher_id: string;
  name: string;
  join_code: string;
  archived_at: string | null;
  created_at: string;
}

export interface AssignmentInfo {
  id: string;
  class_id: string;
  content_id: string;
  assigned_at: string;
  due_at: string | null;
  visible: number;
  title?: string;
  kind?: ClassroomContentKind;
  completed?: number;
  score?: number | null;
  unresolvedFlagCount?: number;
  max_attempts?: number | null;
  accept_late?: number;
  /** Student view only: attempts remaining (null = unlimited) and why work is closed, if it is. */
  attemptsLeft?: number | null;
  closed?: ClosedReason | null;
}

export type ClosedReason = 'attempts' | 'late';

export interface AttemptPolicyInfo {
  effectiveDueAt: string | null;
  attemptsUsed: number;
  attemptsAllowed: number | null;
  attemptsLeft: number | null;
  closed: ClosedReason | null;
}

export interface QuestionStat {
  index: number;
  prompt: string;
  correctCount: number;
  wrongCount: number;
  totalCount: number;
}

export interface AssignmentDetailResponse {
  assignment: AssignmentInfo;
  policy: AttemptPolicyInfo;
  content: { title: string; subtitle: string; kind: string; body: ClassroomContentBody };
  previousAttempt: {
    score: number | null;
    xpEarned: number | null;
    submissionText?: string | null;
    review?: WritingReview | null;
    reviewedAt?: string | null;
  } | null;
}

export interface FlagInfo {
  id: string;
  student_id: string;
  assignment_id: string;
  question_index: number;
  reason: string;
  created_at: string;
  resolved_at: string | null;
  studentName: string;
  contentTitle: string;
}

export interface AttemptResponseEntry {
  index: number;
  correct: boolean;
  answerGiven?: string;
}

export interface RosterStudent {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  completedAssignments: number;
  totalAssignments: number;
  averageScore: number;
  lastActiveAt: string | null;
  awaitingReview: number;
}

export interface AnnouncementInfo {
  id: string;
  class_id: string;
  title: string;
  body: string;
  pinned: number;
  created_at: string;
}

export interface GradebookResponse {
  assignments: { id: string; title: string; kind: ClassroomContentKind; due_at: string | null }[];
  roster: RosterStudent[];
  cells: { studentId: string; assignmentId: string; completed: boolean; score: number | null }[];
}

export type AttentionReason = 'overdue' | 'not-started' | 'inactive' | 'struggling';
export type StudentAssignmentStatus = 'done' | 'awaiting-review' | 'overdue' | 'pending';

export interface StudentAssignmentReport {
  assignmentId: string;
  title: string;
  kind: ClassroomContentKind;
  status: StudentAssignmentStatus;
  dueAt: string | null;
  score: number | null;
  completedAt: string | null;
  attemptsUsed: number;
  attemptsAllowed: number | null;
  override: { dueAt: string | null; extraAttempts: number } | null;
}

export interface StudentSummary {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  completed: number;
  total: number;
  averageScore: number | null;
  lastActiveAt: string | null;
  awaitingReview: number;
  overdue: number;
  reasons: AttentionReason[];
}

export interface StudentReport extends StudentSummary {
  assignments: StudentAssignmentReport[];
  byKind: { kind: ClassroomContentKind; averageScore: number; count: number }[];
}

export interface BankQuestion {
  id: string;
  type: ExerciseType;
  prompt: string;
  answer: string;
  options?: string[];
  hint?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type BankQuestionInput = Pick<BankQuestion, 'type' | 'prompt' | 'answer' | 'options' | 'hint' | 'tags'>;

export interface ClassroomProfile {
  id: string;
  name: string;
  email: string;
}

// Lesson/quiz reduce to a flat Exercise[] so the exercise renderers never branch on kind.
// Reading, listening and writing have their own flows and no Exercise[].
export function bodyToExercises(body: ClassroomContentBody): Exercise[] {
  if (body.kind === 'lesson') return body.exercises;
  if (body.kind !== 'quiz') return [];
  return body.items.map((item) => ({
    type: item.type,
    prompt: item.prompt,
    answer: item.answer,
    options: item.options,
    hint: item.hint,
  }));
}
