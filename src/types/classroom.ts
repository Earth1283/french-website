import type { CEFRBand, Exercise, ExerciseType, VocabItem } from './index';

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

export type ClassroomContentBody = ClassroomLessonBody | ClassroomQuizBody;

export interface ClassroomContent {
  id: string;
  teacher_id: string;
  kind: 'lesson' | 'quiz';
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
  kind?: 'lesson' | 'quiz';
  completed?: number;
  score?: number | null;
  content?: ClassroomContent;
  unresolvedFlagCount?: number;
}

export interface QuestionStat {
  index: number;
  prompt: string;
  correctCount: number;
  wrongCount: number;
  totalCount: number;
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
}

export interface ClassroomProfile {
  id: string;
  name: string;
  email: string;
}

// Both content kinds reduce to a flat Exercise[] so the exercise renderers never branch on kind.
export function bodyToExercises(body: ClassroomContentBody): Exercise[] {
  if (body.kind === 'lesson') return body.exercises;
  return body.items.map((item) => ({
    type: item.type,
    prompt: item.prompt,
    answer: item.answer,
    options: item.options,
    hint: item.hint,
  }));
}
