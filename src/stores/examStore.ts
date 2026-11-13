import { getReadingDoc } from '../data/exam/reading';
import { gradeReading } from '../utils/readingGrade';
import { useNotebookStore, captureCorrections } from './notebookStore';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  DelfLevel, ListeningResult, ReadingResult, MockExamResult, SpeakingAttempt, SpeakingEvaluation, WritingEvaluation, WritingSubmission,
} from '../types/exam';

// Keeps the list bounded: a submission stores the full essay text.
const MAX_WRITING_SUBMISSIONS = 100;
const MAX_LISTENING_RESULTS = 300;
const MAX_SPEAKING_ATTEMPTS = 100;
const MAX_MOCK_RESULTS = 50;

interface ExamStore {
  level: DelfLevel | null;
  listeningResults: ListeningResult[];
  readingResults: ReadingResult[];
  writingSubmissions: WritingSubmission[];
  drafts: Record<string, string>;
  speakingAttempts: SpeakingAttempt[];
  mockResults: MockExamResult[];
  setLevel: (level: DelfLevel) => void;
  addReadingResult: (result: ReadingResult) => void;
  addListeningResult: (result: ListeningResult) => void;
  addWritingSubmission: (submission: WritingSubmission) => void;
  setEvaluation: (submissionId: string, evaluation: WritingEvaluation) => void;
  setDraft: (taskId: string, text: string) => void;
  clearDraft: (taskId: string) => void;
  addSpeakingAttempt: (attempt: SpeakingAttempt) => void;
  setSpeakingEvaluation: (attemptId: string, evaluation: SpeakingEvaluation) => void;
  addMockResult: (result: MockExamResult) => void;
  setMockReading: (resultId: string, reading: number | null) => void;
  clearHistory: () => void;
}

export const useExamStore = create<ExamStore>()(
  persist(
    (set, get) => ({
      level: null,
      listeningResults: [],
      readingResults: [],
      writingSubmissions: [],
      drafts: {},
      speakingAttempts: [],
      mockResults: [],

      setLevel: (level) => set({ level }),

      addReadingResult: (result) => {
        const doc = getReadingDoc(result.docId);
        if (doc) {
          const graded = gradeReading(doc.questions, result.answers);
          doc.questions.forEach((q, i) => {
            if (graded[i]) return;
            useNotebookStore.getState().recordMistake({
              id: `reading:${doc.id}:${i}`, source: 'reading', sourceTitle: doc.title,
              sourceHref: `/exam/reading/${doc.id}`, prompt: q.prompt, original: result.answers[i] ?? '',
              corrected: q.answer, explanation: q.explanation ?? '', context: doc.passage,
              exercise: { type: q.type === 'multiple-choice' ? 'multiple-choice' : 'translation', prompt: q.prompt, answer: q.answer, options: q.options, explanation: q.explanation },
            });
          });
        }
        set(s => ({ readingResults: [...s.readingResults, result].slice(-MAX_LISTENING_RESULTS) }));
      },

      addListeningResult: (result) =>
        set(s => ({ listeningResults: [...s.listeningResults, result].slice(-MAX_LISTENING_RESULTS) })),

      addWritingSubmission: (submission) => {
        captureCorrections('writing', submission.taskId, submission.evaluation?.corrections);
        set(s => ({ writingSubmissions: [...s.writingSubmissions, submission].slice(-MAX_WRITING_SUBMISSIONS) }));
      },

      setEvaluation: (submissionId, evaluation) => {
        const submission = get().writingSubmissions.find(s => s.id === submissionId);
        if (submission) captureCorrections('writing', submission.taskId, evaluation.corrections);
        set(s => ({
          writingSubmissions: s.writingSubmissions.map(w => (w.id === submissionId ? { ...w, evaluation } : w)),
        }));
      },

      setDraft: (taskId, text) => set(s => ({ drafts: { ...s.drafts, [taskId]: text } })),

      clearDraft: (taskId) =>
        set(s => {
          const { [taskId]: _removed, ...rest } = s.drafts;
          return { drafts: rest };
        }),

      addSpeakingAttempt: (attempt) =>
        set(s => ({ speakingAttempts: [...s.speakingAttempts, attempt].slice(-MAX_SPEAKING_ATTEMPTS) })),

      setSpeakingEvaluation: (attemptId, evaluation) =>
        set(s => ({
          speakingAttempts: s.speakingAttempts.map(a => (a.id === attemptId ? { ...a, evaluation } : a)),
        })),

      addMockResult: (result) => set(s => ({ mockResults: [...s.mockResults, result].slice(-MAX_MOCK_RESULTS) })),

      setMockReading: (resultId, reading) =>
        set(s => ({ mockResults: s.mockResults.map(r => (r.id === resultId ? { ...r, reading } : r)) })),

      clearHistory: () =>
        set({ listeningResults: [], readingResults: [], writingSubmissions: [], drafts: {}, speakingAttempts: [], mockResults: [] }),
    }),
    { name: 'french-exam-prep' },
  ),
);
