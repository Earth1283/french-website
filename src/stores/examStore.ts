import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  DelfLevel, ListeningResult, MockExamResult, SpeakingAttempt, SpeakingEvaluation, WritingEvaluation, WritingSubmission,
} from '../types/exam';

// Keeps the list bounded: a submission stores the full essay text.
const MAX_WRITING_SUBMISSIONS = 100;
const MAX_LISTENING_RESULTS = 300;
const MAX_SPEAKING_ATTEMPTS = 100;
const MAX_MOCK_RESULTS = 50;

interface ExamStore {
  level: DelfLevel | null;
  listeningResults: ListeningResult[];
  writingSubmissions: WritingSubmission[];
  drafts: Record<string, string>;
  speakingAttempts: SpeakingAttempt[];
  mockResults: MockExamResult[];
  setLevel: (level: DelfLevel) => void;
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
    (set) => ({
      level: null,
      listeningResults: [],
      writingSubmissions: [],
      drafts: {},
      speakingAttempts: [],
      mockResults: [],

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
        set({ listeningResults: [], writingSubmissions: [], drafts: {}, speakingAttempts: [], mockResults: [] }),
    }),
    { name: 'french-exam-prep' },
  ),
);
