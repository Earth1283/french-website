import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DelfLevel, ListeningResult, WritingEvaluation, WritingSubmission } from '../types/exam';

// Keeps the list bounded: a submission stores the full essay text.
const MAX_WRITING_SUBMISSIONS = 100;
const MAX_LISTENING_RESULTS = 300;

interface ExamStore {
  level: DelfLevel | null;
  listeningResults: ListeningResult[];
  writingSubmissions: WritingSubmission[];
  drafts: Record<string, string>;
  setLevel: (level: DelfLevel) => void;
  addListeningResult: (result: ListeningResult) => void;
  addWritingSubmission: (submission: WritingSubmission) => void;
  setEvaluation: (submissionId: string, evaluation: WritingEvaluation) => void;
  setDraft: (taskId: string, text: string) => void;
  clearDraft: (taskId: string) => void;
  clearHistory: () => void;
}

export const useExamStore = create<ExamStore>()(
  persist(
    (set) => ({
      level: null,
      listeningResults: [],
      writingSubmissions: [],
      drafts: {},

      setLevel: (level) => set({ level }),

      addListeningResult: (result) =>
        set(s => ({ listeningResults: [...s.listeningResults, result].slice(-MAX_LISTENING_RESULTS) })),

      addWritingSubmission: (submission) =>
        set(s => ({ writingSubmissions: [...s.writingSubmissions, submission].slice(-MAX_WRITING_SUBMISSIONS) })),

      setEvaluation: (submissionId, evaluation) =>
        set(s => ({
          writingSubmissions: s.writingSubmissions.map(w => (w.id === submissionId ? { ...w, evaluation } : w)),
        })),

      setDraft: (taskId, text) => set(s => ({ drafts: { ...s.drafts, [taskId]: text } })),

      clearDraft: (taskId) =>
        set(s => {
          const { [taskId]: _removed, ...rest } = s.drafts;
          return { drafts: rest };
        }),

      clearHistory: () => set({ listeningResults: [], writingSubmissions: [], drafts: {} }),
    }),
    { name: 'french-exam-prep' },
  ),
);
